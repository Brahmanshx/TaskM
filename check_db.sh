docker exec task_manager_postgres psql -U admin -d task_db -c "SELECT id, title, \"reminderTime\" FROM \"Tasks\" ORDER BY \"createdAt\" DESC LIMIT 10;"
