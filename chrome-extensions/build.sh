rm bin/*
rmdir bin

mkdir -p bin

zip -r bin/MoodleTabRenamer.zip MoodleTabRenamer -x *.DS_Store
zip -r bin/TauVideoDownloader.zip TauVideoDownloader -x *.DS_Store

/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --pack-extension=./TauVideoDownloader
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --pack-extension=./MoodleTabRenamer

mv *.crx bin
mv *.pem bin