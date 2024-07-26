---
layout: doc
title: Testing
---

# Testing

In the case you don't have a charger that supports OCPP 2.0.1 to experiment with, we can recommend using the Linux Foundation Energy project EVerest.
[See here](https://github.com/EVerest) for the repository.
They have built an open source version of charger firmware and also allow for using it as a simulator.
They support OCPP 2.0.1 which makes it a great testing opportunity with CitrineOS.
For the long route of setting up EVerst you can follow their documentation and build the project yourself.[See here for Docs](https://everest.github.io/latest/general/03_quick_start_guide.html)

As a short-cut you can also use their demo repository that hosts a Docker packaged EVerest image. [See here for Github Repo](https://github.com/EVerest/everest-demo)

If you want to run EVerest on the side while developing and making changes, you can follow the steps below.
1. Run your citrine instance locally with `docker compose up -d` in the Citrine repository
1. Clone the [EVerest Demo](https://github.com/EVerest/everest-demo) repository and `cd` into the repo
1. With citrine running excute an "add charger" script at `./citrineos/add-charger.sh` This adds a charger, location and password for the charge to Citrine
1. Bring up EVerest with `docker compose --project-name everest-ac-demo --file "docker-compose.ocpp201.yml" up -d`
1. Copy over the appropriate device model with `docker cp manager/device_model_storage_citrineos_sp1.db \
   everest-ac-demo-manager-1:/ext/source/build/dist/share/everest/modules/OCPP201/device_model_storage.db`
1. Start EVerst having OCPP2.0.1 support with `docker exec everest-ac-demo-manager-1 sh /ext/source/build/run-scripts/run-sil-ocpp201.sh`
