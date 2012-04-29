from setuptools import setup, find_packages

setup(name="webcat",
    version="0.1",
    packages=find_packages(exclude=['ez_setup', 'examples', 'tests']),
    zip_safe=False,
    install_requires=[
    # -*- Extra requirements: -*-
        "tornado",
        "tornadio2",
    ],
    entry_points = {
        'console_scripts': [
            'webcat-serv    =   webcat.app:serv',
        ]
    },
    test_suite='nose.collector',
    include_package_data = True,
    package_data = {
        '': ['*.css', '*.js','*.html'],
    }
)
