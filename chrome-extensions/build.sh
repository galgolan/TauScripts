rm MoodleTabRenamer.zip
zip -r MoodleTabRenamer.zip MoodleTabRenamer -x *.DS_Store

rm TauVideoDownloader.zip
zip -r TauVideoDownloader.zip TauVideoDownloader -x *.DS_Store

/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --pack-extension=./TauVideoDownloader
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --pack-extension=./MoodleTabRenamer