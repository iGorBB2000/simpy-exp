import simpy
import random
import statistics

patients_handled = 0

class Hospital():
    def __init__(self, env, num_doctors):
        self.env = env
        self.doctor = simpy.Resource(env, num_doctors)

    def handle_patient(self, patient):
        yield self.env.timeout(random.randint(2, 7))
        print(f"Patient {patient} is finished being handled {self.env.now:.2f}")
    
def patient(env, name, hospital):
    global patients_handled
    print(f"Patient {name} entered the ER at {env.now:.2f}")
    with hospital.doctor.request() as request:
        yield request
        print(f"Patient {name} begins being handled at {env.now:.2f}")
        yield env.process(hospital.handle_patient(name))
        print(f"Patient {name} leaves hospital at {env.now:.2f}")
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
    
print("Starting Hospital Simulation")
env = simpy.Environment()
env.process(setup(env, 2))
env.run(until=15)

print(f"Patients handled: {str(patients_handled)}")
