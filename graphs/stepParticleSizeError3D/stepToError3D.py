import json
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits import mplot3d


def getZAxis(x, y):
    # x -> particleAxis
    # y -> stepAxis

    return 1


def analyze(table):
    res = [0] * (len(table[0]) - 1)
    for i in range(len(table)):
        # print(len(table[i]))
        for j in range(len(table[i]) - 1):
            res[j] += table[i][j + 1]
    return np.array(res)/len(table)


dataSize = 10
z = [None] * dataSize
dataset = [None] * dataSize
for i in range(dataSize):
    name: str = "data{}.json".format((i + 1) * 100)
    file = open('./datas/{}'.format(name))
    dataset[i] = json.load(file)['data']
    file.close()

for i in range(dataSize):
    z[i] = analyze(dataset[i])

z = np.array(z)
# Read file
# file = open('data_100particles.json')
# data100 = json.load(file)
# file.close()
#
# file = open('data_1000particles.json')
# data1000 = json.load(file)
# file.close()
#
# table100 = data100['data']
# table1000 = data1000['data']
#
# xAxis = np.linspace(1, 24, num=24)
# particles100 = analyze(table100)
# particles1000 = analyze(table1000)

particleAxis = np.linspace(100, 1000, num=10)
stepAxis = np.linspace(1, 24, num=24)
X, Y = np.meshgrid(stepAxis, particleAxis)
# Z = getZAxis(X, Y)
# print(X)
# print(Y)
Z = np.sin(np.sqrt(X ** 2 + Y ** 2))


plt.figure()
ax = plt.axes(projection='3d')
ax.plot_surface(X, Y, z, rstride=1, cstride=1,
                cmap='viridis', edgecolor='none')
# plt.plot(xAxis, particles100, 'b')
# plt.plot(xAxis, particles1000, 'r')
ax.set_xlabel('Step Size')
ax.set_ylabel('Particle Size')
ax.set_zlabel('Error Percent')
# plt.title('')
plt.show()
plt.show()
plt.show()
plt.show()
plt.show()
plt.show()
