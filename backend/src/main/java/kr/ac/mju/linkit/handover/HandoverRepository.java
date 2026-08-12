package kr.ac.mju.linkit.handover;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HandoverRepository extends JpaRepository<Handover, UUID> {

    List<Handover> findAllByOwnerIdOrderByUpdatedAtDescIdAsc(UUID ownerId);

    Optional<Handover> findByIdAndOwnerId(UUID id, UUID ownerId);
}
