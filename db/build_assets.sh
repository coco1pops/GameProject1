convert-excel-to-json --config="$(cat db.params)" > db.json
node buildArrays.js > db1.json
sed '$d' text_assets.json > db2.json
sed 's/{/,/' db1.json > db3.json
cat db2.json db3.json > db4.json
