# -*- mode: ruby -*-
VAGRANTFILE_API_VERSION = "2"
ENV['VAGRANT_DEFAULT_PROVIDER'] = 'docker'

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.define "mongo" do |mongo|
    mongo.vm.provider 'docker' do |d|
      d.image = 'library/mongo'
      d.name = 'appstore_mongo'
      d.ports = ['27017:27017']
    end
  end

  config.vm.define "web" do |web|
    web.vm.provider 'docker' do |d|
      d.build_dir = '.'
      d.name = 'appstore_web'
      d.ports = ['8080:8080', '3000:3000']

      d.link('appstore_mongo:mongo')
    end

    web.vm.hostname = "uappexplorer"
    web.vm.synced_folder "./", "/srv/uappexplorer", id: "vagrant-root"
    web.vm.network "forwarded_port", guest: 8080, host: 8080
  end
end
