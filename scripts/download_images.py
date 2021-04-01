# -*- coding: utf-8 -*-

import argparse
import inspect
import math
import os
from pprint import pprint
import shutil
import sys
import urllib

# add parent directory to sys path to import relative modules
currentdir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parentdir = os.path.dirname(currentdir)
sys.path.insert(0,parentdir)

from lib.io_utils import *
from lib.math_utils import *

# input
parser = argparse.ArgumentParser()
parser.add_argument('-in', dest="INPUT_FILE", default="path/to/metadata.csv", help="Path to csv file")
parser.add_argument('-image', dest="IMAGE_URL_COLUMN", default="primaryImageSmall", help="Column to retrieve asset url from")
parser.add_argument('-filename', dest="FILENAME_COLUMN", default="Filename", help="The name of the filename column that stores the filename")
parser.add_argument('-id', dest="ID_COLUMN", default="Object ID", help="ID column will be used to name the file (if 'Filename' column is not already set)")
parser.add_argument('-limit', dest="LIMIT", default=-1, type=int, help="Limit downloads; -1 for no limit")
parser.add_argument('-out', dest="OUTPUT_DIR", default="tmp/downloads/", help="Output directory; make sure there is enough space!")
parser.add_argument('-overwrite', dest="OVERWRITE", action="store_true", help="Overwrite existing data?")
parser.add_argument('-probe', dest="PROBE", action="store_true", help="Just output debug info")
a = parser.parse_args()

# Make sure output dirs exist
makeDirectories(a.OUTPUT_DIR)

downloads = 0
nofileCount = 0
# Read data
fieldNames, rows = readCsv(a.INPUT_FILE)
if a.FILENAME_COLUMN not in fieldNames:

    if a.ID_COLUMN not in fieldNames:
        print(f'Could not find ID column "{a.ID_COLUMN}" in file. Exiting.')
        sys.exit()

    print("Filename not provided; will use ID for this")

    fieldNames.append(a.FILENAME_COLUMN)

if a.IMAGE_URL_COLUMN not in fieldNames:
    print(f'Could not find Image URL column "{a.IMAGE_URL_COLUMN}" in file. Exiting.')
    sys.exit()

fileCount = len(rows)

for i, row in enumerate(rows):
    url = row[a.IMAGE_URL_COLUMN]

    if len(url) < 1:
        print(f'Could not find url for item {row[a.ID_COLUMN]}. Skipping.')
        continue

    ext = getFileExt(url)
    filename = str(row[a.ID_COLUMN]) + ext if a.FILENAME_COLUMN not in row or len(row[a.FILENAME_COLUMN]) < 1 else row[a.FILENAME_COLUMN]
    filepath = a.OUTPUT_DIR + filename
    rows[i][a.FILENAME_COLUMN] = filename
    if a.PROBE:
        if not os.path.isfile(filepath):
            nofileCount += 1
            downloads += 1
    else:
        downloadBinaryFile(url, filepath, a.OVERWRITE)
        downloads += 1
        total = fileCount
        if a.LIMIT > 0:
            total = a.LIMIT
        printProgress(i+1, total)

    if a.LIMIT > 0 and downloads >= a.LIMIT:
        break

if a.PROBE:
    print("%s files to download" % nofileCount)
else:
    print("Updating original file with filenames")
    writeCsv(a.INPUT_FILE, rows, fieldNames)
