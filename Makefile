SRC_DIR = src
TEST_DIR = test
BUILD_DIR = build

PREFIX = .
DIST_DIR = ${PREFIX}/dist

JS_ENGINE ?= `which node nodejs`
COMPILER = ${JS_ENGINE} ${BUILD_DIR}/uglify.js --unsafe
POST_COMPILER = ${JS_ENGINE} ${BUILD_DIR}/post-compile.js

BASE_FILES = ${SRC_DIR}/core.js\
	${SRC_DIR}/plugin.js

	MODULES = ${SRC_DIR}/intro.js\
	${BASE_FILES}\
	${SRC_DIR}/outro.js

CANVASIZE = ${DIST_DIR}/canvasize.js
CANVASIZE_MIN = ${DIST_DIR}/canvasize.min.js

CANVASIZE_VER = $(shell cat version.txt)
VER = sed "s/@VERSION/${CANVASIZE_VER}/"

DATE=$(shell git log -1 --pretty=format:%ad)

all: update_submodules core

core: canvasize min lint size
	@@echo "canvasize build complete."

${DIST_DIR}:
	@@mkdir -p ${DIST_DIR}

canvasize: ${CANVASIZE}

${CANVASIZE}: ${MODULES} | ${DIST_DIR}
	@@echo "Building" ${CANVASIZE}

	@@cat ${MODULES} | \
		sed 's/@DATE/'"${DATE}"'/' | \
		${VER} > ${CANVASIZE};

lint: canvasize
	@@if test ! -z ${JS_ENGINE}; then \
		echo "Checking Canvasize against JSLint..."; \
		${JS_ENGINE} build/jslint-check.js; \
	else \
		echo "You must have NodeJS installed in order to test Canvasize against JSLint."; \
	fi

size: canvasize min
	@@if test ! -z ${JS_ENGINE}; then \
		gzip -c ${CANVASIZE_MIN} > ${CANVASIZE_MIN}.gz; \
		wc -c ${CANVASIZE} ${CANVASIZE_MIN} ${CANVASIZE_MIN}.gz | ${JS_ENGINE} ${BUILD_DIR}/sizer.js; \
		rm ${CANVASIZE_MIN}.gz; \
	else \
		echo "You must have NodeJS installed in order to size Canvasize."; \
	fi

freq: canvasize min
	@@if test ! -z ${JS_ENGINE}; then \
		${JS_ENGINE} ${BUILD_DIR}/freq.js; \
	else \
		echo "You must have NodeJS installed to report the character frequency of minified Canvasize."; \
	fi

min: canvasize ${CANVASIZE_MIN}

${CANVASIZE_MIN}: ${CANVASIZE}
	@@if test ! -z ${JS_ENGINE}; then \
		echo "Minifying Canvasize" ${CANVASIZE_MIN}; \
		${COMPILER} ${CANVASIZE} > ${CANVASIZE_MIN}.tmp; \
		${POST_COMPILER} ${CANVASIZE_MIN}.tmp > ${CANVASIZE_MIN}; \
		rm -f ${CANVASIZE_MIN}.tmp; \
	else \
		echo "You must have NodeJS installed in order to minify Canvasize."; \
	fi

clean:
	@@echo "Removing Distribution directory:" ${DIST_DIR}
	@@rm -rf ${DIST_DIR}

distclean: clean
	@@echo "Removing submodules"
	@@rm -rf test/qunit

update_submodules:
	@@if [ -d .git ]; then \
		if git submodule status | grep -q -E '^-'; then \
			git submodule update --init --recursive; \
		else \
			git submodule update --init --recursive --merge; \
		fi; \
	fi;

.PHONY: all canvasize lint min clean distclean update_submodules core
