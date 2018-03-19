import json
import csv
import matplotlib.pyplot as pl
import numpy as np
import scipy as sp
import scipy.ndimage
from statistics import median

def no_str_keys(d):
    if not d:
        return d
    for k in d.keys():
        if type(k) is not str:
            try:
                d[str(k)] = d[k]
            except:
                try:
                    d[repr(k)] = d[k]
                except:
                    pass
            del i[k]
    return(d)

def writejson(filename, bins, outliers, clusters, num_dimensions):
    l = [[None for i in range(num_dimensions)] for j in range(num_dimensions)]

    with open(filename, 'w') as out:
        for i in range(num_dimensions):
            for j in range(num_dimensions):
                di = {}

                di['bins'] = (bins[i][j]) # num_bins x num_bins; each has stuff
                di['outliers'] = ((outliers[i][j]))
                di['clusters'] = (clusters)

                l[i][j] = di
        s = json.dumps(l, separators=(',', ':'))
        out.write(s)


"""
Write out 2d axis data 
"""
def output(filename, bins):
    with open(filename, 'w') as out:
        for i in range(len(bins)):
            out.write(str(bins[i]))
            out.write('\n')

def getNeighbors(x,y):
    if x == 0 and y == 0:
        return [(0,1), (1,1), (1,0)]
    elif x == 0:
        return [(0,y+1), (0,y-1), (1,y+1), (1,y), (1,y-1)]
    elif y == 0:
        return [(x,1), (x+1,0), (x-1,0), (x+1,1), (x-1,1)]
    else:
        return([(x,y+1), (x,y-1), (x+1,y+1), (x+1,y-1), (x-1,y+1), (x-1,y-1), (x+1, y), (x-1, y)])

"""
Cluster data points for user interaction with focus
"""
def cluster(bins, num_bins):
    # smooth out the data with gaussian filter
    gaus_bins = gaus_filter(bins, num_bins)

    # iteratively go from the most frequent to 10% of the most frequent
    # when a block may be added to both clusters, add it to the one with the closest 
    # peak height
    
    clusters = {}
    # find the order of coordinates sorted by frequency
    l = []
    for i in range(num_bins):
        for j in range(num_bins):
            if gaus_bins[i][j] != 0:
                l.append((gaus_bins[i][j], (i, j))) # freq, tuple coordinates
    l.sort(key=lambda x: x[0], reverse=True)

    cluster_map = [[0 for a in range(num_bins)] for b in range(num_bins)]
    max_freq = l[0][0]
    for freq, tup in l:
        if freq <= max_freq * 0.1:
            return(clusters)
        # if neighbors in clusters:
        neighbors = getNeighbors(tup[0], tup[1])
        potentials = []
        for neighbor in neighbors:
            if neighbor in clusters:
                potentials.append(clusters[neighbor])
        # new cluster
        if len(neighbors) == 0:
            clusters[str(tup)] = freq
            cluster_map[tup[0]][tup[1]] = freq
        # join to existing cluster
        else:
            min_freq = float('inf')
            for i in range(0, len(neighbors)):
                if neighbors[i] in clusters:
                    min_freq = min(min_freq, clusters[neighbors[i]])
            # first of its neighbors (new cluster)
            if min_freq == float('inf'):
                min_freq = freq
            clusters[str(tup)] = min_freq

            cluster_map[tup[0]][tup[1]] = min_freq
    return(cluster_map)
    #return(clusters)


"""
Smooth out 2d bin data using gaussian filter
"""
def gaus_filter(bins, num_bins):
    # find standard deviation of each dimension
    # use https://stackoverflow.com/questions/33548639/how-can-i-smooth-elements-of-a-two-dimensional-array-with-differing-gaussian-fun
    # convert to numpy array
    np_bins = np.array(bins)
    # Use average std dev as sigma
    sigma = [sum(np.std(np_bins, axis=0))/num_bins, sum(np.std(np_bins, axis=1))/num_bins]
    std = np.std(np_bins, dtype=np.float64)
    #sigma = [std, std]
    sigma = [0.5,0.5]

    res = sp.ndimage.filters.gaussian_filter(np_bins, sigma, mode='constant')
    # Show results visually; helps for tuning alpha
    pl.imshow(np_bins, cmap='Blues', interpolation='nearest')
    pl.xlabel("$x$")
    pl.ylabel("$y$")
    pl.savefig("array.png")
    pl.imshow(res, cmap='Blues', interpolation='nearest')
    pl.xlabel("$x$")
    pl.ylabel("$y$")
    pl.savefig("array2.png")

    return(res.tolist())

def normalize(grid, total_max_freq, num_dimensions, num_bins):
    normalized_bins = [[None for i in range(num_dimensions)] for i in range(num_dimensions)]
    ratio = 1 / total_max_freq

    for i in range(1, num_dimensions):
        for j in range(i+1, num_dimensions):
            cur_pair = grid[i][j]
            normalized_pair = [[0 for a in range(num_bins)] for b in range(num_bins)]
            if cur_pair:
                for x in range(num_bins):
                    for y in range(num_bins):
                        normalized_pair[x][y] = cur_pair[x][y] * ratio
                #print_bins(cur_pair)
                #print_bins(normalized_pair)
            normalized_bins[i][j] = normalized_pair
    return(normalized_bins)

def union_outliers(bin1, bin2):
    return(list(set(bin1).union(set(bin2))))

def intersect_outliers(bin1, bin2):
    return(list(set(bin1) & set(bin2)))

def getBuckets(val1, val2, min_dim_i, max_dim_i, min_dim_j, max_dim_j, num_bins):
    bucket1 = int((val1 - min_dim_i) / (max_dim_i - min_dim_i) * 10)
    bucket2 = int((val2 - min_dim_j) / (max_dim_j - min_dim_j) * 10)
    if bucket1 == num_bins:
        bucket1 -= 1
    if bucket2 == num_bins:
        bucket2 -= 1
    return (bucket1, bucket2)

def print_bins(bins):
    for i in range(len(bins)):
        for j in bins[i]:
            print(j, end='\t')
        print('')
    print('---')

def getMaxMin(text):
    max_dim = text[1][:]
    min_dim = text[1][:]
    for row in text[2:]:
        count = 0
        for val in row:
            max_dim[count] = max(max_dim[count], val)
            min_dim[count] = min(min_dim[count], val)
            count += 1
    return (max_dim, min_dim)

"""
Args: 
threshold (10% of max freq)
max_empty (number empty neighbors outlier can have [6])
max_empty_border (number of border outlier can have [4])
max_empty_corner (neighbors a corner outlier can have [2])
grid

Functionality:
Returns outlier bins (list of tuples (x,y))
"""
def isolationFilter(threshold, grid):
    max_empty = 6
    max_empty_border = 4
    max_empty_corner = 2
    res = []
    num_bins = len(grid)
    if num_bins <= 2:
        return []
    for i in range(num_bins):
        for j in range(num_bins):
            if grid[i][j] == 0 or grid[i][j] > threshold:
                continue
            else:
                empty_count = 0
                checked = True
                # check empty!
                # corners - 3 surroundings
                if i + j == 0:
                    if grid[1][0] == 0:
                        empty_count += 1
                    if grid[1][1] == 0:
                        empty_count += 1
                    if grid[0][1] == 0:
                        empty_count += 1
                elif (i == num_bins - 1 and j == 0):
                    if grid[num_bins - 2][0] == 0:
                        empty_count += 1
                    if grid[num_bins - 2][1] == 0:
                        empty_count += 1
                    if grid[num_bins - 1][1] == 0:
                        empty_count += 1
                elif (i == 0 and j == num_bins - 1):
                    if grid[0][num_bins - 2] == 0:
                        empty_count += 1
                    if grid[1][num_bins - 2] == 0:
                        empty_count += 1
                    if grid[1][num_bins - 1] == 0:
                        empty_count += 1
                elif i + j == num_bins * 2:
                    if grid[num_bins - 1][num_bins - 2] == 0:
                        empty_count += 1
                    if grid[num_bins - 2][num_bins - 2] == 0:
                        empty_count += 1
                    if grid[num_bins - 2][num_bins - 1] == 0:
                        empty_count += 1
                else:
                    checked = False
                if empty_count > max_empty_corner:
                    res.append((i, j))

                if checked:
                    continue
                checked = True
                # borders - 5 surroundings
                if i == 0:
                    if grid[1][j] == 0:
                        empty_count += 1
                    if grid[1][j+1] == 0:
                        empty_count += 1
                    if grid[1][j-1] == 0:
                        empty_count += 1
                    if grid[0][j+1] == 0:
                        empty_count += 1
                    if grid[0][j-1] == 0:
                        empty_count += 1
                elif j == 0:
                    if grid[i][1] == 0:
                        empty_count += 1
                    if grid[i+1][1] == 0:
                        empty_count += 1
                    if grid[i-1][1] == 0:
                        empty_count += 1
                    if grid[i+1][0] == 0:
                        empty_count += 1
                    if grid[i-1][0] == 0:
                        empty_count += 1
                else:
                    checked = False
                if empty_count > max_empty_border:
                    res.append((i,j))

                if checked:
                    continue

                # center
                if j > 0 and j < num_bins - 1 and i > 0 and i < num_bins - 1:
                    if grid[i][j+1] == 0:
                        empty_count += 1
                    if grid[i][j-1] == 0:
                        empty_count += 1
                    if grid[i+1][j] == 0:
                        empty_count += 1
                    if grid[i-1][j] == 0:
                        empty_count += 1
                    if grid[i+1][j+1] == 0:
                        empty_count += 1
                    if grid[i-1][j-1] == 0:
                        empty_count += 1
                    if grid[i+1][j-1] == 0:
                        empty_count += 1
                    if grid[i-1][j+1] == 0:
                        empty_count += 1
                if empty_count > max_empty:
                    res.append((i,j))

    return(res)

"""
Args: 
threshold (10% of max freq)
max_empty (number empty neighbors outlier can have [6])
max_empty_border (number of border outlier can have [4])
max_empty_corner (neighbors a corner outlier can have [2])
grid

Functionality:
Returns outlier bins (list of tuples (x,y)) where the median of surroundings is
less than 5% of max freq
"""
def medianFilter(threshold, grid):
    med = int(threshold/2)
    #print('med is ' + str(med))
    max_empty = 6
    max_empty_border = 4
    max_empty_corner = 2
    res = []
    num_bins = len(grid)
    if num_bins <= 2:
        return []
    for i in range(num_bins):
        for j in range(num_bins):
            if grid[i][j] == 0 or grid[i][j] > threshold:
                continue
            else:
                neighbors = []
                checked = True
                # check empty!
                # corners - 3 surroundings
                if i + j == 0:
                    neighbors.append(grid[1][0])
                    neighbors.append(grid[1][1])
                    neighbors.append(grid[0][1])
                elif (i == num_bins - 1 and j == 0):
                    neighbors.append(grid[num_bins - 2][0])
                    neighbors.append(grid[num_bins - 2][1])
                    neighbors.append(grid[num_bins - 1][1])
                elif (i == 0 and j == num_bins - 1):
                    neighbors.append(grid[0][num_bins - 2])
                    neighbors.append(grid[1][num_bins - 2])
                    neighbors.append(grid[1][num_bins - 1])
                elif i + j == num_bins * 2:
                    neighbors.append(grid[num_bins - 1][num_bins - 2])
                    neighbors.append(grid[num_bins - 2][num_bins - 2])
                    neighbors.append(grid[num_bins - 2][num_bins - 1])
                else:
                    checked = False

                if checked:
                    if median(neighbors) < med:
                        res.append((i, j))
                    continue

                checked = True
                # borders - 5 surroundings
                if i == 0:
                    neighbors.append(grid[1][j])
                    neighbors.append(grid[1][j+1])
                    neighbors.append(grid[1][j-1])
                    neighbors.append(grid[0][j+1])
                    neighbors.append(grid[0][j-1])
                elif j == 0:
                    neighbors.append(grid[j][1])
                    neighbors.append(grid[j+1][1])
                    neighbors.append(grid[j-1][1])
                    neighbors.append(grid[j+1][0])
                    neighbors.append(grid[j-1][0])
                else:
                    checked = False

                if checked:
                    if median(neighbors) < med:
                        res.append((i, j))
                    continue

                # center
                if j > 0 and j < num_bins - 1 and i > 0 and i < num_bins - 1:
                    neighbors.append(grid[i][j+1])
                    neighbors.append(grid[i][j-1])
                    neighbors.append(grid[i+1][j])
                    neighbors.append(grid[i-1][j])
                    neighbors.append(grid[i+1][j+1])
                    neighbors.append(grid[i-1][j-1])
                    neighbors.append(grid[i+1][j-1])
                    neighbors.append(grid[i-1][j+1])
                if checked and median(neighbors) < med:
                    res.append((i,j))

    return(res)

filename = 'age-alc'
with open (filename + '.csv', 'r') as f:
    reader = csv.reader(f, delimiter = ',', quoting=csv.QUOTE_NONNUMERIC)
    text = []
    for row in reader: 
        text.append(row)

if __name__ == '__main__':
    # initialize relevant variables
    num_bins = 10
    dimensions = text[0]
    num_dimensions = len(dimensions)
    axesbins = [[None for i in range(num_dimensions)] for i in range(num_dimensions)]
    clusterbins = [[None for i in range(num_dimensions)] for i in range(num_dimensions)]
    # Given two axes i and j, axesoutliers[i][j] holds a list of (val1, val2) that are outliers. 
    axesoutliers = [[None for i in range(num_dimensions)] for i in range(num_dimensions)]
    #print(dimensions)
    
    # find max and min for each dimension; max[i] holds the max for the i'th dimension, or dimensions[i]
    max_dim, min_dim = getMaxMin(text)
    with open('metadata.json', 'w') as out:
        d = {}
        d['labels'] = (text[0]) 
        d['max'] = max_dim
        d['min'] = min_dim
        s = json.dumps(d, separators=(',', ':'))
        out.write(s)

    total_max_freq = 0
    
    # Create 2d array to store relationship between each pair of axes
    for i in range(1, num_dimensions):
        for j in range(i+1, num_dimensions):
            # compare the i'th and j'th dimensions
            # create a binxbin 2d array to store the relationship between each pair of axes
            
            max_freq = float('-inf')
            min_freq = float('inf')
            bins = [[0 for a in range(num_bins)] for b in range(num_bins)]
            for k in range(1, len(text)):
                val1, val2 = text[k][i], text[k][j]
                bucket1, bucket2 = getBuckets(val1, val2, min_dim[i], max_dim[i], min_dim[j], max_dim[j], num_bins)

                bins[bucket1][bucket2] += 1
                max_freq = max(max_freq, bins[bucket1][bucket2])
                min_freq = min(min_freq, bins[bucket1][bucket2])
                total_max_freq = max(max_freq, total_max_freq)

            #print('Comparing ' + str(dimensions[i]) + ' and ' + str(dimensions[j]))
            # Create outliers
            isolation_bins = isolationFilter(int(max_freq * 0.1), bins)
            median_bins = medianFilter(int(max_freq * 0.1), bins)

            # optionally combine the results for outliers, could also use intersect.
            outlier_bins = union_outliers(isolation_bins, median_bins)

            # Get the original data points that actually relates to these outliers. 
            outliers = []
            for k in range(1, len(text)):
                val1, val2 = text[k][i], text[k][j]
                bucket1, bucket2 = getBuckets(val1, val2, min_dim[i], max_dim[i], min_dim[j], max_dim[j], num_bins)
                if (bucket1, bucket2) in outlier_bins:
                    outliers.append((val1, val2))

            #print_bins(bins)
            outliers = list(set(outliers))
            #print('outliers:')
            #print(outliers)
            #print('outlier_bins:')
            #print(outlier_bins)
            #print('threshold: ' + str(int(max_freq * 0.1)))
            axesbins[i][j] = bins
            axesbins[j][i] = bins

            # clustering
            clusterbins[i][j] = cluster(bins, num_bins)

            axesoutliers[i][j] = outliers

    # normalize
    axesbinsnormalized = normalize(axesbins, total_max_freq, num_dimensions, num_bins)

    output('normalized_trends.txt', axesbinsnormalized)
    output('outliers.txt', axesoutliers)
    output('clusters.txt', clusterbins)
    writejson('output.json', axesbinsnormalized, axesoutliers, clusterbins, num_dimensions)
