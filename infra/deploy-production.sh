#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "usage: $0 <image-uri>" >&2
  exit 2
fi

readonly image_uri="$1"
readonly aws_region="ap-northeast-2"
readonly db_secret_id="arn:aws:secretsmanager:ap-northeast-2:625250728854:secret:DatabasePassword-NAHnhVc1UHTD-ZZtBK2"
readonly mail_secret_id="linkit/production/gmail-smtp"
readonly frontend_url="https://d1y43yo05gqvik.cloudfront.net"

db_password=$(aws secretsmanager get-secret-value \
  --region "$aws_region" \
  --secret-id "$db_secret_id" \
  --query SecretString \
  --output text)
mail_json=$(aws secretsmanager get-secret-value \
  --region "$aws_region" \
  --secret-id "$mail_secret_id" \
  --query SecretString \
  --output text)
mail_username=$(python3 -c \
  'import json,sys; print(json.load(sys.stdin)["username"])' \
  <<<"$mail_json")
mail_password=$(python3 -c \
  'import json,sys; print(json.load(sys.stdin)["appPassword"].replace(" ", ""))' \
  <<<"$mail_json")

registry="${image_uri%%/*}"
aws ecr get-login-password --region "$aws_region" \
  | docker login --username AWS --password-stdin "$registry"
docker pull "$image_uri"

docker rm -f linkit-app-before-deploy >/dev/null 2>&1 || true
docker rename linkit-app linkit-app-before-deploy
docker stop linkit-app-before-deploy >/dev/null

rollback() {
  docker rm -f linkit-app >/dev/null 2>&1 || true
  docker rename linkit-app-before-deploy linkit-app
  docker start linkit-app >/dev/null
}
trap rollback ERR

docker run -d --name linkit-app --restart unless-stopped --network linkit \
  -p 80:8080 \
  -e SPRING_PROFILES_ACTIVE=postgres \
  -e DB_URL=jdbc:postgresql://linkit-db:5432/linkit \
  -e DB_USERNAME=linkit \
  -e DB_PASSWORD="$db_password" \
  -e SESSION_COOKIE_SECURE=true \
  -e LINKIT_SECURITY_CSRF_COOKIE_SECURE=true \
  -e MAIL_PROVIDER=smtp \
  -e MAIL_HOST=smtp.gmail.com \
  -e MAIL_PORT=587 \
  -e MAIL_USERNAME="$mail_username" \
  -e MAIL_PASSWORD="$mail_password" \
  -e MAIL_SMTP_AUTH=true \
  -e MAIL_SMTP_STARTTLS=true \
  -e MAIL_FROM="$mail_username" \
  -e FRONTEND_BASE_URL="$frontend_url" \
  "$image_uri" >/dev/null

ready=false
for _ in $(seq 1 60); do
  if curl --fail --silent http://localhost/api/v1/auth/csrf >/dev/null; then
    ready=true
    break
  fi
  sleep 2
done
[[ "$ready" == true ]]

trap - ERR
docker rm linkit-app-before-deploy >/dev/null
docker image prune -f >/dev/null
docker inspect --format='image={{.Config.Image}} status={{.State.Status}}' linkit-app
