#!/usr/bin/env python

from bson import json_util
import json, logging
from pymongo import MongoClient
import cherrypy

logger = logging.getLogger('spider')

def jsonify(function):
	def return_json(*args):
		cherrypy.response.headers["Access-Control-Allow-Origin"] = '*'
		cherrypy.response.headers['Content-Type'] = 'application/json'
		return json.dumps(function(*args), default=json_util.default)

	return return_json

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

		'''
		formatter = logging.Formatter("%(asctime)s - %(levelname)s:%(funcName)s() '%(message)s'")
		logger_sh = logging.StreamHandler()
		logger_sh.setFormatter(formatter)
		logger.addHandler(logger_sh)
		logger.setLevel(logging.DEBUG)
		'''

	def basic_info(self, app):
		info = {}
		for field in self.basic_info_fields:
			if field in app:
				info[field] = app[field]
			else:
				info[field] = None

		return info

	@cherrypy.expose
	@jsonify
	def apps(self):
		apps = []
		docs = self.collection.find()

		for app in docs:
			apps.append(self.basic_info(app))

		return apps

	@cherrypy.expose
	@jsonify
	def app(self, name):
		app = self.collection.find_one({'name': name})
		return app

	@cherrypy.expose
	@jsonify
	def categories(self):
		categories = self.collection.distinct('category')
		for category in categories:
			parent = category.split(';')[0]
			if parent not in categories:
				categories.append(parent)

		return categories

	@cherrypy.expose
	@jsonify
	def category_stats(self):
		categories = json.loads(self.categories())

		stats = {}
		for category in categories:
			stats[category] = self.collection.find({'category': {'$regex': category}}).count()

		stats['Any'] = self.collection.count()

		return stats

	@cherrypy.expose
	@jsonify
	def alive(self):
		return ''

if __name__ == '__main__':
	app = App()
	cherrypy.quickstart(app)
