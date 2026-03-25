# Build stage
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Copy the entire project
COPY . .

# Build the Go application for ARM64
RUN CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -o main .

# Final stage
FROM alpine:latest

# Upgrade all packages to get security fixes (e.g., zlib 1.3.2-r0)
RUN apk update && apk upgrade --no-cache

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
