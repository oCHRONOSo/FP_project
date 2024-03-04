#!/bin/bash
cp -r /usr/share/easy-rsa /etc/openvpn
cp /etc/openvpn/easy-rsa/vars.example /etc/openvpn/easy-rsa/vars

read -p "continue" cont

./easyrsa init-pki
./easyrsa build-ca
./easyrsa build-server-full servidor
./easyrsa build-client-full cliente
./easyrsa gen-dh
./easyrsa export-p12 cliente

read -p "continue" cont

cp /etc/openvpn/easy-rsa/pki/issued/servidor.crt /etc/openvpn
cp /etc/openvpn/easy-rsa/pki/private/servidor.key /etc/openvpn
cp /etc/openvpn/easy-rsa/pki/ca.crt /etc/openvpn
cp /etc/openvpn/easy-rsa/pki/dh.pem /etc/openvpn

ls /etc/openvpn

read -p "continue" cont

cp /etc/openvpn/easy-rsa/pki/private/cliente.p12 /tmp
chmod 444 /tmp/cliente.p12

# Routed
read -p "introduce una ip dinstinta de todo ej:(11.0.0.0): " ip_w
read -p "la mascara de esta ip ($ip_w) ej:(255.255.0.0): " mask_w
read -p "introduce la red y: " net_y
read -p "la mascara de esta red ($net_y) ej:(255.255.0.0): " mask_y

echo " 
dev tun

server $ip_w $mask_w

ca ca.crt

cert servidor.crt
key servidor.key
dh dh.pem

push \"route $net_y $mask_y\"

" > routed-server

openvpn routed-server

# Bridged

echo "
dev tap0

server-bridge $ip_rout_z $mask_z #dhcp_range

ca ca.crt
cert servidor.crt
key servidor.key
dh dh.pem

" > /etc/openvpn/bridged-server

cp /usr/share/doc/openvpn/examples/sample-scripts/bridge-st* /etc/openvpn
#edit bridge-start

openvpn bridged-server


