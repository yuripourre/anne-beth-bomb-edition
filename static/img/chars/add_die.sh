#!/bin/bash

# Check if an image file is passed as a parameter
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <image-file>"
    exit 1
fi

# Input image file
input_file="$1"
output_file="output_$input_file"

# Step 1: Increase the image area by 32 pixels in height
convert "$input_file" -background none -gravity South -splice 0x32 temp_image.png

# Step 2: Copy the 32x32 pixel area starting at x=32
convert temp_image.png -crop 32x32+32+0 +repage cropped_area.png

# Step 3: Desaturate the cropped area by reducing saturation (set to grayscale without losing transparency)
convert cropped_area.png -colorspace RGB -channel RGB -colorspace Gray +channel cropped_area_gray.png

# Step 4: Create the first replication with 100% opacity and paste at x=0, y=128
convert temp_image.png cropped_area_gray.png -geometry +0+128 -composite temp_image.png

# Step 5: Create the second replication with 60% opacity and paste at x=32, y=128
convert temp_image.png cropped_area_gray.png -geometry +32+128 -compose dissolve -define compose:args=60 -composite temp_image.png

# Step 6: Create the third replication with 20% opacity and paste at x=64, y=128
convert temp_image.png cropped_area_gray.png -geometry +64+128 -compose dissolve -define compose:args=20 -composite "$output_file"

# Cleanup temp files
rm cropped_area.png cropped_area_gray.png temp_image.png

echo "Output saved as $output_file"

