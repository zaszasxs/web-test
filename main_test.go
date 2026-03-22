package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestScoresHandler(t *testing.T) {
	// Reset scores for testing
	scores = []Score{}

	t.Run("Post and Get Scores", func(t *testing.T) {
		// Test POST
		newScore := Score{Name: "TestPlayer", Time: 5000}
		body, _ := json.Marshal(newScore)
		req, _ := http.NewRequest("POST", "/api/scores", bytes.NewBuffer(body))
		rr := httptest.NewRecorder()
		handler := http.HandlerFunc(ScoresHandler)

		handler.ServeHTTP(rr, req)

		if status := rr.Code; status != http.StatusCreated {
			t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusCreated)
		}

		// Test GET
		req, _ = http.NewRequest("GET", "/api/scores", nil)
		rr = httptest.NewRecorder()
		handler.ServeHTTP(rr, req)

		if status := rr.Code; status != http.StatusOK {
			t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
		}

		var receivedScores []Score
		json.NewDecoder(rr.Body).Decode(&receivedScores)

		if len(receivedScores) != 1 {
			t.Errorf("expected 1 score, got %d", len(receivedScores))
		}

		if receivedScores[0].Name != "TestPlayer" {
			t.Errorf("expected TestPlayer, got %s", receivedScores[0].Name)
		}
	})

	t.Run("Scores Sorting and Limit", func(t *testing.T) {
		scores = []Score{}
		handler := http.HandlerFunc(ScoresHandler)

		// Add 12 scores
		for i := 0; i < 12; i++ {
			s := Score{Name: "Player", Time: int64(2000 - i*100)} // Lower time is better
			body, _ := json.Marshal(s)
			req, _ := http.NewRequest("POST", "/api/scores", bytes.NewBuffer(body))
			rr := httptest.NewRecorder()
			handler.ServeHTTP(rr, req)
		}

		// Get scores
		req, _ := http.NewRequest("GET", "/api/scores", nil)
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, req)

		var receivedScores []Score
		json.NewDecoder(rr.Body).Decode(&receivedScores)

		if len(receivedScores) != 10 {
			t.Errorf("expected 10 scores, got %d", len(receivedScores))
		}

		// Best score should be the one with lowest time (2000 - 11*100 = 900)
		if receivedScores[0].Time != 900 {
			t.Errorf("expected best score to be 900, got %d", receivedScores[0].Time)
		}
	})
}
