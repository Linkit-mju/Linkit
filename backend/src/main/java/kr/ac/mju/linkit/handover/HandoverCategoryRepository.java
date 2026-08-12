package kr.ac.mju.linkit.handover;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HandoverCategoryRepository extends JpaRepository<HandoverCategory, UUID> {

    List<HandoverCategory> findAllByOwnerIdOrderByCreatedAtAscIdAsc(UUID ownerId);

    Optional<HandoverCategory> findByIdAndOwnerId(UUID id, UUID ownerId);
}
