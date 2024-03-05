#!/bin/bash
while true; do
read -p "select option:
1 Routed
2 Bridged
: " opt

if [ "$opt" == "1" ]; then
echo "starting Routed config ..."
# Routed
read -p "introduce una ip dinstinta de todo ej:(11.0.0.0): " ip_w
read -p "la mascara de esta ip ($ip_w) ej:(255.255.0.0): " mask_w
read -p "introduce la red del host : " net_y
read -p "la mascara de esta red ($net_y) ej:(255.255.0.0): " mask_y

echo " 
dev tun

server $ip_w $mask_w

ca ca.crt

cert servidor.crt
key servidor.key
dh dh.pem

push \" route $net_y $mask_y \"

" > /etc/openvpn/routed-server

cat /etc/openvpn/routed-server

echo "\n if all good launch the server: openvpn routed-server "
#openvpn routed-server
break
elif [ "$opt" == "2" ]; then
echo "starting Bridged config ..."
# Bridged
read -p "introduce la ip del router (la que esta relacionada con el host): " ip_z
read -p "la mascara de esta ip ($ip_z) ej:(255.255.0.0): " mask_z
read -p "introduce la primera ip del rango del dhcp (la red del host): " dhcp_uno
read -p "introduce la segunda ip del rango del dhcp (la red del host): " dhcp_dos 

echo "
dev tap0

server-bridge $ip_z $mask_z $dhcp_uno $dhcp_dos

ca ca.crt
cert servidor.crt
key servidor.key
dh dh.pem

" > /etc/openvpn/bridged-server

cat /etc/openvpn/bridged-server

read -p "continue (check if all good)" cont

cp /usr/share/doc/openvpn/examples/sample-scripts/bridge-st* /etc/openvpn
echo "don't forget to edit bridge-start:
(eth= interface del router de la red del host,
eth_ip= ip del router de la red del host,
eth_netmask= mascara de la red del host,
eth_broadcast= ip del broadcast de la red del host)"

read -p "continue if done editing bridge-start" cont


echo "\n if all good launch the  bridge-start script,
and the server: openvpn bridged-server "
#openvpn bridged-server
break
else
    echo "wrong option please select 1 or 2"
fi

done





