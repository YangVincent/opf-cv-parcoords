# https://stackoverflow.com/questions/33548639/how-can-i-smooth-elements-of-a-two-dimensional-array-with-differing-gaussian-fun
# https://matthew-brett.github.io/teaching/smoothing_intro.html

import numpy as np
import matplotlib.pyplot as plt

np.set_printoptions(precision=4, suppress=True)
np.random.seed(5)

n_points = 40
x_vals = np.arange(n_points)
y_vals = np.random.normal(size = n_points)
plt.bar(x_vals, y_vals)
plt.show()

x = np.arange(-6, 6, 0.1)
y = 1 / np.sqrt(2 * np.pi) * np.exp(-x ** 2 / 2)
plt.plot(x,y)
plt.show()

def sigma2fwhm(sigma):
    return sigma * np.sqrt(8 * np.log(2))

def fwhm2sigma(fwhm):
    return fwhm / np.sqrt(8 * np.log(2))

FWHM = 4
sigma = fwhm2sigma(FWHM)
x_position = 13 # 14th point
kernel_at_pos = np.exp(-(x_vals - x_position) ** 2 / (2 * sigma ** 2))
kernel_at_pos = kernel_at_pos / sum(kernel_at_pos)
plt.bar(x_vals, kernel_at_pos)
plt.show()
print(kernel_at_pos)
