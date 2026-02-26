package edu.college.choisein3.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Тесты MoralAnalysisService")
class MoralAnalysisServiceTest {

    private MoralAnalysisService moralAnalysisService;

    @BeforeEach
    void setUp() {
        moralAnalysisService = new MoralAnalysisService();
    }

    @Test
    @DisplayName("parseMoralWeights — парсинг строки весов")
    void parseMoralWeights_validString() {
        String input = "Альтруизм=2, Сочувствие=1, Честность=3";

        Map<String, Integer> result = moralAnalysisService.parseMoralWeights(input);

        assertThat(result).containsEntry("Альтруизм", 2);
        assertThat(result).containsEntry("Сочувствие", 1);
        assertThat(result).containsEntry("Честность", 3);
    }

    @Test
    @DisplayName("parseMoralWeights — пустая строка")
    void parseMoralWeights_emptyString() {
        assertThat(moralAnalysisService.parseMoralWeights("")).isEmpty();
        assertThat(moralAnalysisService.parseMoralWeights(null)).isEmpty();
    }

    @Test
    @DisplayName("calculateMoralScores — подсчёт баллов по ответам")
    void calculateMoralScores() {
        Map<String, String> userAnswers = new HashMap<>();
        userAnswers.put("0", "A");
        userAnswers.put("1", "B");

        Map<String, Map<String, Map<String, Integer>>> questionsData = new HashMap<>();
        Map<String, Map<String, Integer>> options0 = new HashMap<>();
        options0.put("A", Map.of("Альтруизм", 2, "Сочувствие", 1));
        questionsData.put("0", options0);
        Map<String, Map<String, Integer>> options1 = new HashMap<>();
        options1.put("B", Map.of("Эгоизм", 1, "Прагматизм", 2));
        questionsData.put("1", options1);

        Map<String, Integer> scores = moralAnalysisService.calculateMoralScores(userAnswers, questionsData);

        assertThat(scores.get("Альтруизм")).isEqualTo(2);
        assertThat(scores.get("Сочувствие")).isEqualTo(1);
        assertThat(scores.get("Эгоизм")).isEqualTo(1);
        assertThat(scores.get("Прагматизм")).isEqualTo(2);
    }

    @Test
    @DisplayName("calculatePercentages — процентное распределение")
    void calculatePercentages() {
        Map<String, Integer> scores = new HashMap<>();
        scores.put("Альтруизм", 50);
        scores.put("Эгоизм", 50);

        Map<String, Double> percentages = moralAnalysisService.calculatePercentages(scores);

        assertThat(percentages.get("Альтруизм")).isEqualTo(50.0);
        assertThat(percentages.get("Эгоизм")).isEqualTo(50.0);
    }

    @Test
    @DisplayName("calculatePercentages — нулевая сумма")
    void calculatePercentages_zeroTotal() {
        Map<String, Integer> scores = new HashMap<>();
        scores.put("Альтруизм", 0);
        scores.put("Эгоизм", 0);

        Map<String, Double> percentages = moralAnalysisService.calculatePercentages(scores);

        assertThat(percentages.get("Альтруизм")).isEqualTo(0.0);
    }

    @Test
    @DisplayName("determinePersonalityType — одна доминирующая категория")
    void determinePersonalityType_singleDominant() {
        Map<String, Double> percentages = new HashMap<>();
        percentages.put("Альтруизм", 80.0);
        percentages.put("Эгоизм", 20.0);

        String result = moralAnalysisService.determinePersonalityType(percentages);

        assertThat(result).isEqualTo("Альтруист");
    }

    @Test
    @DisplayName("determinePersonalityType — две близкие категории (разница < 10%)")
    void determinePersonalityType_twoClose() {
        Map<String, Double> percentages = new HashMap<>();
        percentages.put("Альтруизм", 52.0);
        percentages.put("Прагматизм", 48.0);
        percentages.put("Эгоизм", 0.0);

        String result = moralAnalysisService.determinePersonalityType(percentages);

        assertThat(result).contains("Альтруист");
        assertThat(result).contains("Прагматик");
    }

    @Test
    @DisplayName("determinePersonalityType — пустой ввод")
    void determinePersonalityType_empty() {
        Map<String, Double> percentages = new HashMap<>();

        String result = moralAnalysisService.determinePersonalityType(percentages);

        assertThat(result).isEqualTo("Неопределенный тип");
    }
}
