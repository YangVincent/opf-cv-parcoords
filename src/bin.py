import csv

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
                    pass
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

def medianFilter():
    pass

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
    print(dimensions)
    
    # find max and min for each dimension; max[i] holds the max for the i'th dimension, or dimensions[i]
    max_dim, min_dim = getMaxMin(text)
    print(max_dim)
    print(min_dim)
    
    # Create 2d array to store relationship between each pair of axes
    for i in range(1, num_dimensions):
        for j in range(i+1, num_dimensions):
            # compare the i'th and j'th dimensions
            # create a binxbin 2d array to store the relationship between each pair of axes
            
            max_freq = 0
            bins = [[0 for a in range(num_bins)] for b in range(num_bins)]
            for k in range(1, len(text)):
                val1 = text[k][i]
                val2 = text[k][j]
                bucket1 = int((val1 - min_dim[i]) / (max_dim[i] - min_dim[i]) * 10)
                bucket2 = int((val2 - min_dim[j]) / (max_dim[j] - min_dim[j]) * 10)
                if bucket1 == num_bins:
                    bucket1 -= 1
                if bucket2 == num_bins:
                    bucket2 -= 1
                bins[bucket1][bucket2] += 1
                max_freq = max(max_freq, bins[bucket1][bucket2])

            print('Comparing ' + str(dimensions[i]) + ' and ' + str(dimensions[j]))
            # Create outliers
            outliers = isolationFilter(int(max_freq * 0.1), bins)
            print_bins(bins)
            print(outliers)
            print('threshold: ' + str(int(max_freq * 0.1)))
            axesbins[i][j] = bins
            axesbins[j][i] = bins
