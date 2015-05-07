# -*- mode: ruby -*-

Vagrant.configure(2) do |config|
  config.vm.provision "shell", path: "vagrant-bootstrap.sh"
  config.vm.box = "ubuntu/vivid64"
  config.vm.provider "virtualbox" do |vb|
    vb.gui = true
    vb.memory = "3072"
  end
end
