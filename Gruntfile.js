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
                    'gumup.js': 'src/gumup.js'
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
                    'gumup.min.js': 'gumup.js'
                }
            },
            options: {
                sourceMap: true
            }
        },

        jasmine: {
            all: {
                src: 'src/gumup.js',
                options: {
                    specs: ['spec/gumup-spec.js'],
                    version: '1.3.1'
                }
            }
        },

        nodeunit: {
            tests: 'test/node/*.js'
        }

    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('make', ['concat', 'uglify']);
    grunt.registerTask('test', ['nodeunit', 'jasmine']);
    grunt.registerTask('spec', ['jasmine:all:build']);

    grunt.registerTask('default', ['test', 'make']);

};
