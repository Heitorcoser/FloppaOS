#!/bin/bash
# Monta o APK sem Gradle: ./build.sh  (senha da chave em MOSCA_PASS)
set -e
cd "$(dirname "$0")/android"
SDK=/opt/android/sdk; BT=$SDK/build-tools/34.0.0; JAR=$SDK/platforms/android-34/android.jar
rm -rf build && mkdir -p build/classes build/dex assets
cp ../app/index.html ../app/core.js ../app/brain.js ../app/doom.js ../app/doomview.js ../app/doom64.js assets/
$BT/aapt2 compile --dir res -o build/res.zip
$BT/aapt2 link -o build/base.apk -I $JAR --manifest AndroidManifest.xml -A assets build/res.zip --java build/gen
javac -source 8 -target 8 -bootclasspath $JAR -classpath $JAR -d build/classes $(find src build/gen -name '*.java') 2>&1 | grep -v "warning\|^Note" || true
$BT/d8 --lib $JAR --output build/dex $(find build/classes -name '*.class')
cp build/base.apk build/semdex.apk && (cd build/dex && zip -q ../semdex.apk classes.dex)
$BT/zipalign -f 4 build/semdex.apk build/aligned.apk
$BT/apksigner sign --ks mosca.keystore --ks-pass pass:${MOSCA_PASS:-moscapilota} --ks-key-alias mosca --out ../MoscaPilota.apk build/aligned.apk
$BT/apksigner verify ../MoscaPilota.apk && ls -la ../MoscaPilota.apk
