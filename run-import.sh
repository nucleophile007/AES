#!/bin/zsh
set +H
export DB_HOST='aws-1-us-west-1.pooler.supabase.com'
export DB_PORT='5432'
export DB_USER='postgres.nmlgjqvpdeukgfityuyv'
export DB_PASS='Aqweds123@!!!!'
export DB_NAME='postgres'
node import-database.mjs --file database_export_1778402586511.json --host "$DB_HOST" --port "$DB_PORT" --user "$DB_USER" --password "$DB_PASS" --database "$DB_NAME"
