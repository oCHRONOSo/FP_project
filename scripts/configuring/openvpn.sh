#!/bin/bash

#cp -r /usr/share/easy-rsa /etc/openvpn
read -p "continue (make sure you copied easy-rsa, have ip-forwarding activated and to run this script in /etc/openvpn/easy-rsa)" cont

if [ ! -f /etc/openvpn/easy-rsa/vars ]; then
    cp /etc/openvpn/easy-rsa/vars.example /etc/openvpn/easy-rsa/vars
fi


read -p "continue (modify vars file first, alt+F2 for a new session)" cont


./easyrsa init-pki
echo "\n PKI ALL GOOD"
./easyrsa build-ca
echo "\n CA ALL GOOD"
./easyrsa build-server-full servidor
echo "\n SERVIDOR ALL GOOD"
./easyrsa build-client-full cliente
echo "\n CLIENTE ALL GOOD"
./easyrsa gen-dh
echo "\n DH ALL GOOD"
./easyrsa export-p12 cliente
echo "\n EXPORT ALL GOOD"
read -p "continue" cont

cp /etc/openvpn/easy-rsa/pki/issued/servidor.crt /etc/openvpn
cp /etc/openvpn/easy-rsa/pki/private/servidor.key /etc/openvpn
cp /etc/openvpn/easy-rsa/pki/ca.crt /etc/openvpn
cp /etc/openvpn/easy-rsa/pki/dh.pem /etc/openvpn

ls /etc/openvpn | grep -e dh.pem -e ca.crt -e servidor.crt -e servidor.key

read -p "continue (verify: ca.crt,dh.pem,servidor.crt,servidor.key)" cont

cp /etc/openvpn/easy-rsa/pki/private/cliente.p12 /tmp
chmod 444 /tmp/cliente.p12

ls -al /tmp | grep cliente




