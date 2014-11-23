# -*- mode: ruby -*-
VAGRANTFILE_API_VERSION = "2"
CHEF_VERSION = "11.10"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "ubuntu/trusty64"

  config.vm.network "private_network", ip: "192.168.52.200"
  config.vm.network "forwarded_port", guest: 8080, host: 8080

  config.vm.hostname = "ubuntu-appstore"
  config.vm.synced_folder "./", "/srv/ubuntu-appstore", id: "vagrant-root"

  config.vm.provider "virtualbox" do |v|
    v.memory = 512
    v.name = "ubuntu-appstore"
  end

  config.berkshelf.enabled = true
  config.omnibus.chef_version = CHEF_VERSION
  config.vm.provision "chef_solo" do |chef|
    chef.cookbooks_path = "cookbooks"

    chef.add_recipe "ubuntu-appstore::default"
    chef.add_recipe "ubuntu-appstore::dev"
    chef.add_recipe "mongodb::default"

    chef.json = {}
  end
end
