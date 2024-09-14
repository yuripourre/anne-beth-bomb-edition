APP_NAME=anne-beth-bomber
ITCH_USER=yuripourre
ASSETS_FOLDER=static

echo "Building HTML artifact..."
# Build file
npm run prod

# Copy assets to the dist folder
echo "Copying assets..."
mkdir -p dist
cp -a $ASSETS_FOLDER dist/$ASSETS_FOLDER

# Ignore editor folder
rm -rf dist/assets/$ASSETS_FOLDER/editor

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
./butler/butler push dist $ITCH_USER/$APP_NAME:html
