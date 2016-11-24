VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

    config.vm.provider "virtualbox" do |v|
        v.memory = 1024
    end

    config.vm.box = "ubuntu/trusty64"
    config.vm.network "private_network", ip: "192.168.57.123"
    config.vm.hostname = "uappexplorer"
    config.vm.synced_folder "./", "/srv/uappexplorer", id: "vagrant-root"

    config.vm.provision :docker
    config.vm.provision :docker_compose, project_name: "uappexplorer", yml: "/vagrant/env/docker-compose.yml", rebuild: true, run: "always"

    config.vm.provision "shell", path: "./env/vagrant-setup.sh"
    config.vm.provision "shell", run: "always", inline: "service nginx restart"
end
