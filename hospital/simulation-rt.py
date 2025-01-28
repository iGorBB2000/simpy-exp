import simpy
import random
import statistics
from datetime import datetime

patients_handled = 0

class Hospital():
    def __init__(self, env, num_doctors):
        self.env = env
        self.doctor = simpy.Resource(env, num_doctors)

    def handle_patient(self, patient):
        yield self.env.timeout(random.randint(2, 7))
        print_w_ts(f"Patient {patient} is finished being handled {self.env.now:.2f}")
    
def patient(env, name, hospital):
    global patients_handled
    print_w_ts(f"Patient {name} entered the ER at {env.now:.2f}")
    with hospital.doctor.request() as request:
        yield request
        print_w_ts(f"Patient {name} begins being handled at {env.now:.2f}")
        yield env.process(hospital.handle_patient(name))
        print_w_ts(f"Patient {name} leaves hospital at {env.now:.2f}")
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


def print_w_ts(message):
    print(f"{datetime.now().strftime("%d-%m-%Y %H:%M:%S")} | {message}")
    
print_w_ts("Starting Hospital Simulation")
### Main difference - using RealtimeEnvironment, where factor [s] is used to define the timescale
env = simpy.rt.RealtimeEnvironment(factor=60)
env.process(setup(env, 2))
env.run(until=15)

print_w_ts(f"Patients handled: {str(patients_handled)}")
