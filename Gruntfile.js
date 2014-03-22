module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        meta: {
            banner:
                '// Namespace.js\n' +
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
                    'dist/namespace.js': 'src/namespace.js'
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
                    'dist/namespace.min.js': 'dist/namespace.js'
                }
            }
        },

        jasmine: {
            all: {
                src: 'dist/namespace.js',
                options: {
                    specs: 'spec/namespaceSpec.js'
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jasmine');

    grunt.registerTask('default', ['concat', 'uglify', 'jasmine']);

};
