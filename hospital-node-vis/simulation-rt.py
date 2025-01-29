import simpy
import random
import json
from datetime import datetime

patients_handled = 0

class Hospital():
    def __init__(self, env, num_doctors):
        self.env = env
        self.doctor = simpy.Resource(env, num_doctors)

    def handle_patient(self, patient):
        yield self.env.timeout(random.randint(2, 7))
        print_msg({'patient': patient, 'status': 'treated', 'time': self.env.now})
    
def patient(env, name, hospital):
    global patients_handled
    print_msg({'patient': name, 'status': 'entered', 'time': env.now})
    with hospital.doctor.request() as request:
        yield request
        print_msg({'patient': name, 'status': 'being_treated', 'time': env.now})
        yield env.process(hospital.handle_patient(name))
        print_msg({'patient': name, 'status': 'left', 'time': env.now})
        patients_handled += 1

def setup(env, num_doctors):
    hospital = Hospital(env, num_doctors)
    patient_id = 6

    for i in range(1, patient_id):
        env.process(patient(env, i, hospital))
    
    while True:
        yield env.timeout(random.randint(3,8))
        env.process(patient(env, patient_id, hospital))
        patient_id += 1


def print_msg(message):
    print(json.dumps(message))
    
#print("Starting Hospital Simulation")

env = simpy.rt.RealtimeEnvironment(factor=10)
env.process(setup(env, 2))
env.run()

#print(f"Patients handled: {str(patients_handled)}")
