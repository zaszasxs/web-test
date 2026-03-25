# Build stage
FROM --platform=linux/amd64 golang:1.24-alpine AS builder

WORKDIR /app

# Copy the entire project
COPY . .

# Build the Go application
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o main .

# Final stage
FROM --platform=linux/amd64 alpine:latest

WORKDIR /root/

# Copy the binary and static files from the builder
COPY --from=builder /app/main .
COPY --from=builder /app/index.html .
COPY --from=builder /app/style.css .
COPY --from=builder /app/main.js .
COPY --from=builder /app/public ./public

# The port our Go app listens on
EXPOSE 8080

# Command to run the application
CMD ["./main"]
