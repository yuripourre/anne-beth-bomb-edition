APP_NAME=anne-beth-bomb-edition
ITCH_USER=yuripourre
ASSETS_FOLDER=static

echo "Building HTML artifact..."
# Build file
npm run prod

# Copy assets to the dist folder
echo "Copying assets..."
mkdir -p dist
cp -a $ASSETS_FOLDER dist/main/$ASSETS_FOLDER

# We need to replace the paths to be relative otherwise itch.io cannot load them
cd dist/main
sed -i 's| src="/| src="./|g' "index.html"
sed -i 's| href="/| href="./|g' "index.html"
cd -

echo "Deploying artifact to itch.io..."
# Create butler folder
if [ ! -d "butler" ];then
  echo "Downloading butler..."
  mkdir -p butler
  cd butler
  # Download butler
  wget https://broth.itch.ovh/butler/linux-amd64/LATEST/archive/default -O butler.zip
  # Unzip butler
  unzip butler.zip
  # Delete butler.zip
  rm butler.zip
  # Allow execution
  chmod +x butler
  cd -
else
  echo "Found butler..."
fi
# Publish to Itch.io
./butler/butler push dist/main $ITCH_USER/$APP_NAME:html
