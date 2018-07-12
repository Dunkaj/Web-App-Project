set -e
sudo docker ps
sudo docker pull leadcoin/leadcoin
(sudo docker stop backend && sudo docker rm backend) || true #should not fail if "No such container: backend"
sudo docker run -d -v /home/build/.env:/usr/leadcoin/backend/.env --network host --name backend --rm leadcoin/leadcoin