# Manual QA — direct edit / CJK responsive pass

## surfaceEvidence

| scenario id | criterion reference | surface | exact invocation | verdict | artifactRefs |
|---|---|---|---|---|---|
| direct-edit-1280 | visible direct 수정 control; no header collision/clipping | Web PNG, 1280×900 | `view_image /private/tmp/linkit-direct-edit-1280.png`; inspect `HandoverDocument.tsx` | PASS | shot-1280, source-handover |
| direct-edit-768 | visible direct 수정 control; no header collision/clipping | Web PNG, 768×900 | `view_image /private/tmp/linkit-direct-edit-768.png`; inspect `HandoverDocument.tsx` | PASS | shot-768, source-handover |
| direct-edit-375 | visible direct 수정 control; no header collision/clipping; natural Korean wrapping | Web PNG, 375×812 | `view_image /private/tmp/linkit-direct-edit-375.png`; inspect `HandoverDocument.tsx` | PASS | shot-375, source-handover |

## adversarialCases

| scenario id | criterion reference | adversarial class | expected behavior | verdict | artifactRefs |
|---|---|---|---|---|---|
| direct-edit-375-cjk | Korean body/banner copy | CJK semantic wrapping | `wordBreak: keep-all` prevents syllable splits; no isolated particles/connectives or clipped glyphs | PASS | shot-375, source-handover |
| direct-edit-all-header | header controls | narrow-width collision/clipping | 수정 remains distinct from MoreMenu at every supplied width | PASS | shot-1280, shot-768, shot-375 |
| direct-edit-delete-only | overflow menu | destructive action scope | MoreMenu exposes only 삭제; no extra unintended actions | PASS | source-handover |
| direct-edit-list-overflow | section lists | truncation/overflow | list rows remain visible and page scroll continues; no ellipsis/clipped row text | PASS | shot-1280, shot-768, shot-375 |

## artifactRefs

| id | kind | description | path |
|---|---|---|---|
| shot-1280 | screenshot | Fresh final 1280×900 PNG; valid PNG signature/dimensions | /private/tmp/linkit-direct-edit-1280.png |
| shot-768 | screenshot | Fresh final 768×900 PNG; valid PNG signature/dimensions | /private/tmp/linkit-direct-edit-768.png |
| shot-375 | screenshot | Fresh final 375×812 PNG; valid PNG signature/dimensions | /private/tmp/linkit-direct-edit-375.png |
| source-handover | source | HandoverDocument component and responsive text styles | /Volumes/p41/coding/Linkit/frontend/src/handover/HandoverDocument.tsx |
| source-model | source | Handover model/content lists | /Volumes/p41/coding/Linkit/frontend/src/handover/model.ts |

## verdict

VERDICT: PASS
CONFIDENCE: HIGH

EVIDENCE TRACE: All three supplied PNGs opened directly and validated as 1280×900, 768×900, and 375×812 RGB PNGs. 수정 is a separate visible button beside the ellipsis at desktop and narrow widths; no overlap or clipping is visible. At 375px, Korean text wraps at spaces/semantic boundaries (not inside syllables), with no orphan particles, isolated endings, tofu, or clipped baselines. The content continues below the viewport via the visible scrollbar; list rows are not truncated. Source binds 수정 to `onEdit`, MoreMenu to a single 삭제 item, and applies `wordBreak: keep-all` plus `textWrap="pretty"` to Korean body/banner copy.

FINDINGS: none.

BLOCKING: none.

WHAT IS GOOD: Direct edit affordance is discoverable; header controls stay separated at all widths; deletion remains confined to the overflow menu; responsive cards and lists preserve readable Korean wrapping.
