include_recipe "nodejs::nodejs_from_binary"
include_recipe "nodejs::npm"

nodejs_npm 'express'
nodejs_npm 'mongoose'