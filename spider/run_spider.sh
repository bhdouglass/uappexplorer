#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

/usr/bin/env python ./spider.py
rm /ubuntu-appstore-cache/spider/* -rf
cp /ubuntu-appstore/spider /ubuntu-appstore-cache/spider -r
rm /ubuntu-appstore-cache/spider/* &> /dev/null
