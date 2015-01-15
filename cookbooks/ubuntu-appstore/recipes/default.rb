include_recipe "nodejs::nodejs_from_binary"
include_recipe "nodejs::npm"

nodejs_npm 'supervisor'


%w{g++ fontconfig}.each do |pkg|
    package pkg do
        action :install
    end
end
