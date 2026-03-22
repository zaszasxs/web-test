package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sort"
	"sync"
)

type Score struct {
	Name string `json:"name"`
	Time int64  `json:"time"` // time in ms
}

var (
	scores []Score
	mu     sync.Mutex
)

// ScoresHandler handles the /api/scores endpoint
func ScoresHandler(w http.ResponseWriter, r *http.Request) {
	mu.Lock()
	defer mu.Unlock()

	if r.Method == http.MethodPost {
		var s Score
		if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		scores = append(scores, s)
		// Sort by time (fastest first)
		sort.Slice(scores, func(i, j int) bool {
			return scores[i].Time < scores[j].Time
		})
		// Keep top 10
		if len(scores) > 10 {
			scores = scores[:10]
		}
		w.WriteHeader(http.StatusCreated)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(scores)
}

// InfoHandler returns environment info
func InfoHandler(w http.ResponseWriter, r *http.Request) {
	podName := os.Getenv("POD_NAME")
	if podName == "" {
		podName = "local-dev"
	}
	info := map[string]string{
		"podName": podName,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(info)
}

func main() {
	// API routes
	http.HandleFunc("/api/scores", ScoresHandler)
	http.HandleFunc("/api/info", InfoHandler)

	// Serve static files
	fs := http.FileServer(http.Dir("."))
	http.Handle("/", fs)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Go Backend with API started at http://localhost:%s\n", port)
	err := http.ListenAndServe(":"+port, nil)
	if err != nil {
		log.Fatal(err)
	}
}
