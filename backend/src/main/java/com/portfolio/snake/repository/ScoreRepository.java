package com.portfolio.snake.repository;

import com.portfolio.snake.model.Score;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ScoreRepository extends JpaRepository<Score, Long> {

    List<Score> findTop10ByOrderByScoreDescCreatedAtAsc();

    @Query("SELECT s FROM Score s WHERE s.playerName = :name ORDER BY s.score DESC")
    List<Score> findByPlayerNameOrderByScoreDesc(String name);
}
