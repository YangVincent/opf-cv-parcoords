import csv

def print_bins(bins):
    for i in range(len(bins)):
        print(bins[i])
    print('---')

test = 'test'
with open (test + '.csv', 'r') as f:
    reader = csv.reader(f, delimiter = ',', quoting=csv.QUOTE_NONNUMERIC)
    text = []
    for row in reader: 
        text.append(row)

    num_bins = 10
    dimensions = text[0]
    num_dimensions = len(dimensions)
    axesbins = [[None for i in range(num_dimensions)] for i in range(num_dimensions)]
    print(dimensions)


    # find max and min for each dimension; max[i] holds the max for the i'th dimension, or dimensions[i]
    max_dim = text[1][:]
    min_dim = text[1][:]
    for row in text[2:]:
        count = 0
        for val in row:
            max_dim[count] = max(max_dim[count], val)
            min_dim[count] = min(min_dim[count], val)
            count += 1
    print(max_dim)
    print(min_dim)

    for i in range(1, num_dimensions):
        for j in range(i+1, num_dimensions):
            # compare the i'th and j'th dimensions
            # create a binxbin 2d array to store the relationship between each pair of axes
            
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
                bins[bucket2][bucket1] += 1
            print('Comparing ' + str(dimensions[i]) + ' and ' + str(dimensions[j]))
            print_bins(bins)
            axesbins[i][j] = bins
            axesbins[j][i] = bins
