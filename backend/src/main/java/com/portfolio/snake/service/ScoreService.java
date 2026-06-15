package com.portfolio.snake.service;

import com.portfolio.snake.dto.ScoreRequest;
import com.portfolio.snake.dto.ScoreResponse;
import com.portfolio.snake.model.Score;
import com.portfolio.snake.repository.ScoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScoreService {

    private final ScoreRepository repo;

    public List<ScoreResponse> getLeaderboard() {
        return repo.findTop10ByOrderByScoreDescCreatedAtAsc()
                   .stream()
                   .map(this::toResponse)
                   .toList();
    }

    public ScoreResponse save(ScoreRequest req) {
        Score saved = repo.save(Score.builder()
            .playerName(req.playerName().trim())
            .score(req.score())
            .level(req.level())
            .build());
        return toResponse(saved);
    }

    private ScoreResponse toResponse(Score s) {
        return new ScoreResponse(s.getId(), s.getPlayerName(), s.getScore(), s.getLevel(), s.getCreatedAt());
    }
}
