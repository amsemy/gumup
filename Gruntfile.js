module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        meta: {
            banner:
                '// Gumup\n' +
                '// version: <%= pkg.version %>\n' +
                '// author: <%= pkg.author %>\n' +
                '// license: <%= pkg.license %>\n'
        },

        concat: {
            all: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                files: {
                    'dist/gumup.js': 'src/gumup.js'
                }
            }
        },

        uglify: {
            all: {
                options: {
                    banner: '<%= meta.banner %>',
                    report: 'gzip'
                },
                files: {
                    'dist/gumup.min.js': 'dist/gumup.js'
                }
            }
        },

        jasmine: {
            all: {
                src: 'src/gumup.js',
                options: {
                    specs: 'spec/gumupSpec.js'
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jasmine');

    grunt.registerTask('make', ['concat', 'uglify']);
    grunt.registerTask('test', ['jasmine', 'make']);
    grunt.registerTask('spec', ['jasmine:all:build']);

    grunt.registerTask('default', ['test']);

};
