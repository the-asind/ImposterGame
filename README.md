# Imposter Game

Фронтенд-онли раздача ролей для игры в Imposter. Статичный сайт, кэшируется сервис-воркером и работает офлайн после первого визита.

Слова берутся из `words.txt` (одно слово в строке).

```bash
docker build -t imposter-game .
docker run --rm -p 8080:80 imposter-game
```

favicon by aireench