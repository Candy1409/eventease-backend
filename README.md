# FoodExpress — Deployment Guide

## What's included
- app.py — main Flask app (menu, login/register, order tracker)
- models.py — User database model
- templates/ — index, login, register, track pages
- static/style.css — all styling
- requirements.txt — Python dependencies
- Dockerfile — for containerized deployment

## Environment variables needed (set these when running the container)
- DB_HOST — your RDS endpoint
- DB_USER — your RDS username
- DB_PASSWORD — your RDS password
- DB_NAME — your database name
- SECRET_KEY — any random string, used to secure login sessions

## To deploy on your EC2 instance
1. Copy this whole folder to your server (scp or git)
2. cd into the folder
3. Build: `sudo docker build -t foodexpress-app .`
4. Run:
```
sudo docker run -d --name foodexpress-container -p 8080:5000 \
  -e DB_HOST=your-rds-endpoint \
  -e DB_USER=your-db-user \
  -e DB_PASSWORD=your-db-password \
  -e DB_NAME=foodexpress \
  -e SECRET_KEY=any-random-string \
  foodexpress-app
```
5. Visit http://your-ec2-ip:8080

## What works right now
- Menu page with search + category filters
- User registration and login (stored in MySQL RDS)
- Delivery partner profiles section
- Offers banner strip
- Demo order tracker at /track (simulated status + countdown)

## Not yet built (future work)
- Real shopping cart (Add to Cart buttons are visual only)
- Delivery address collection
- Real checkout/order placement tied to a logged-in user
