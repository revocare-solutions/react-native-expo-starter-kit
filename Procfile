infra: docker compose -f infra/docker-compose.yml up
supabase: while ! curl -sf http://localhost:9000 > /dev/null 2>&1; do sleep 2; done && docker compose -f supabase/docker-compose.yml up
client: while ! curl -sf http://localhost:8000/auth/v1/health > /dev/null 2>&1; do sleep 2; done && cd apps/client && npx expo start --port 8090
admin: while ! curl -sf http://localhost:8000/auth/v1/health > /dev/null 2>&1; do sleep 2; done && cd apps/admin && npx expo start --port 8091
