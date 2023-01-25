## How to use checker.py
Run the command below
```
docker-compose exec backend python -m source.checker $(echo "/app/source/${INSTANCE_NAME}/category.json")
```