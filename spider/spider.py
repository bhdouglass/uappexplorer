#!/usr/bin/env python

from pymongo import MongoClient
from datetime import datetime
import requests, time, sys, random, logging, os, shutil
logger = logging.getLogger('spider')

class Spider(object):
	url = 'https://search.apps.ubuntu.com/api/v1/search'
	log = 'spider.log'
	img_dir = '/ubuntu-appstore-cache/img'

	def __init__(self):
		formatter = logging.Formatter("%(asctime)s - %(levelname)s:%(funcName)s() '%(message)s'")
		logger_fh = logging.FileHandler(self.log)
		logger_fh.setFormatter(formatter)
		logger.addHandler(logger_fh)

		logger_sh = logging.StreamHandler()
		logger_sh.setFormatter(formatter)
		logger.addHandler(logger_sh)

		logger.setLevel(logging.DEBUG)

		logger.info('Connecting to mongo')
		self.client = MongoClient()
		self.db = self.client.ubuntu_apps
		self.collection = self.db.ubuntu_click_apps
		logger.info('Connected to mongo')

		self.apps = {}

	def fetch_image(self, url, filename):
		logger.info('Going to fetch %s' % url)
		response = requests.get(url, stream=True)

		with open(filename, 'wb') as out_file:
			shutil.copyfileobj(response.raw, out_file)

		logger.info('Fetched to %s' % filename)

	def crawl(self):
		logger.info('Sending initial request')
		r = requests.get(self.url)
		self.apps = r.json()
		random.shuffle(self.apps)
		logger.info('Got %d apps' % len(self.apps))

		count = 0
		for app in self.apps:
			count += 1

			logger.info('Fetching %s (%d/%d)' % (app['name'], count, len(self.apps)))
			r = requests.get(app['resource_url'])

			app = dict(app.items() + r.json().items())
			app['last_crawled'] = datetime.now()
			logger.info('Got %s' % app['name'])

			existing = self.collection.find_one({'name': app['name']})
			if existing is not None:
				app['_id'] = existing['_id']
				logger.info('Found existing with id %s' % existing['_id'])
			else:
				logger.info('New app: %s' % app['name'])

			img_dir = os.path.join(self.img_dir, app['name'])
			if not os.path.exists(img_dir):
				os.makedirs(img_dir)

			local_screenshot_urls = []
			if 'screenshot_urls' in app:
				for screenshot in app['screenshot_urls']:
					filename = os.path.join(img_dir, os.path.basename(screenshot))
					local_screenshot_urls.append(filename.replace(self.img_dir, 'cache/img'))
					self.fetch_image(screenshot, filename)

			local_icon_urls = []
			if 'icon_urls' in app:
				for size, icon in app['icon_urls'].iteritems():
					filename = os.path.join(img_dir, os.path.basename(icon))
					local_icon_urls.append(filename.replace(self.img_dir, 'cache/img'))
					self.fetch_image(icon, filename)

			local_icon_url = os.path.join(img_dir, os.path.basename(app['icon_url']))
			self.fetch_image(app['icon_url'], local_icon_url)

			app['local_screenshot_urls'] = local_screenshot_urls
			app['local_icon_urls'] = local_icon_urls
			app['local_icon_url'] = local_icon_url.replace(self.img_dir, 'cache/img')
			self.collection.save(app)

			sleep = random.randint(5, 30)
			logger.info('Going to sleep for %ds', sleep)
			time.sleep(sleep)

if __name__ == '__main__':
	Spider().crawl()
