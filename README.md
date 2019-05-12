# flickLED

Raspberry PiとLEDマトリクスパネルを使って、電車（E233系3000番台）の側面行先表示を再現するためのソフトウェアです。
表示内容はWebブラウザを使って設定することができます。

![写真](https://user-images.githubusercontent.com/46576737/57588448-44f74f00-74e2-11e9-8afa-cd076e25b3ee.png)

動画： [LED行先表示器をブラウザからフリック操作できるようにしてみた](https://www.youtube.com/watch?v=lZAK66Wfo1s)

# システム構成

![システム構成](https://user-images.githubusercontent.com/46576737/57588365-29d80f80-74e1-11e9-81b3-0b181d093da3.png)

# 必要なもの

## ハードウェア

* LEDマトリクスパネル（HUB75規格）を制御することができるRaspberry Pi
* LEDマトリクスパネル（HUB75規格）64×32ドット 2枚
* モダンブラウザ搭載端末

**（参考）作者の環境**

* Raspberry Pi 3 Model B
* Adafruit RGB Matrix + Real Time Clock HAT for Raspberry Pi
* LEDマトリクスパネル（HUB75規格）3mmピッチ 64×32ドット 2枚
* iPhone 8

詳細はこちらの記事をご覧ください。

[Raspberry PiでつくるLED行先表示器 ハードウェア編](http://pumpkinism113.hatenablog.com/entry/2018/01/18/004542)

## ソフトウェア

* 一般的なRaspbian環境（Jessie以降 + Python 2.7）
* [rpi-rgb-led-matrix](https://github.com/hzeller/rpi-rgb-led-matrix) ※後半で解説します

# 使い方

## ハードウェアの準備

以下の図を参考に各部品を接続します。

![ハードウェア接続図](https://user-images.githubusercontent.com/46576737/57588036-2f7f2680-74dc-11e9-9729-b6c0e0611ae7.png)

## ソフトウェアの準備

Raspberry Piに本レポジトリをクローンした後に以下を実行します。

**1. ファイル属性の変更**

`/cgi-bin/` ディレクトリで以下のコマンドを実行し、Pythonファイルに実行権限を付与します。

```
chmod u+x *.py
```

**2. LEDマトリクスパネル制御ライブラリのインストール**

以下のページの **Step 6. Log into your Pi to install and run software** に従ってライブラリ（rpi-rgb-led-matrix）をインストールします。

[Driving Matrices | Adafruit RGB Matrix + Real Time Clock HAT for Raspberry Pi | Adafruit Learning System](https://learn.adafruit.com/adafruit-rgb-matrix-plus-real-time-clock-hat-for-raspberry-pi/driving-matrices)

## プログラムの実行

レポジトリをクローンしたディレクトリで以下のコマンドを実行するとソフトウェアが起動し、LEDマトリクスパネルに行先が表示されます。
（起動時は［普通｜前橋］となります）

```
sudo ./app.py
```

WebブラウザからRaspberry Pi（ポート番号：8000）にアクセスすると、表示内容を設定するためのページが表示されます。
（デフォルトURL： ```http://raspberrypi.local:8000```）

なお、Windows上で実行するとシミュレータモードで動作します（matplotlibが必要となります）。

## 問い合わせ

Twitterアカウント（[@acela86](https://twitter.com/acela86)）にリプライまたはDMをいただければ対応します。

なお、本ソフトウェアと直接関係のない基本的な事項（ファイル操作など）についてはお答えできない場合があります。

## 免責事項

本ソフトウェアの使用により生じたいかなる損害に関して、作者は一切の責任を負いません。

## ライセンス (License)
このソフトウェアはMITライセンスのもとで公開されています。詳細はLICENSEをご覧ください。
(This software is released under the MIT License, see LICENSE.)

また、このソフトウェアは以下のライブラリを再利用しています。
(These libraries are also used in this software.)

* jQuery (MIT license, copyrighted by jQuery Foundation, Inc.)
* jquery.flickEndless (MIT/GPL license, copyrighted by N.Uehara)
