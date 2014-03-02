#!/usr/bin/env python

from bson import json_util
import json, logging
from pymongo import MongoClient
from bottle import route, run, response

logger = logging.getLogger('spider')

class App(object):
	_host = 'localhost'
	_port = 8080
	_debug = False

	basic_info_fields = [
		'price', 'keywords', 'category', 'name', 'icon_url',
		'architecture', 'department', 'title', 'binary_filesize'
	]

	def __init__(self):
		self.client = MongoClient()
		self.db = self.client.ubuntu_apps
		self.collection = self.db.ubuntu_click_apps

		formatter = logging.Formatter("%(asctime)s - %(levelname)s:%(funcName)s() '%(message)s'")
		logger_sh = logging.StreamHandler()
		logger_sh.setFormatter(formatter)
		logger.addHandler(logger_sh)
		logger.setLevel(logging.DEBUG)

	def basic_info(self, app):
		info = {}
		for field in self.basic_info_fields:
			if field in app:
				info[field] = app[field]
			else:
				info[field] = None

		return info

	def response(self):
		response.headers['Access-Control-Allow-Origin'] = '*'
		response.content_type = 'application/json'

	def apps(self):
		apps = []
		docs = self.collection.find()

		for app in docs:
			apps.append(self.basic_info(app))

		self.response()
		return json.dumps(apps, default=json_util.default)

	def app(self, name):
		app = self.collection.find_one({'name': name})

		self.response()
		return json.dumps(app, default=json_util.default)

	def alive(self):
		return ''

	def run(self):
		 run(host=self._host, port=self._port, debug=self._debug)

if __name__ == '__main__':
	app = App()
	route('/apps', method='GET')(app.apps)
	route('/app/<name>', method='GET')(app.app)
	route('/alive', method='GET')(app.alive)

	app.run()
