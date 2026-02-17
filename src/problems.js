// Test 1: Basic Operations
const test1Problems = [
  {
    id: '1-1',
    testNum: 1,
    difficulty: 'Easy',
    title: 'Sum of Array',
    description: 'Write a function that returns the sum of all elements in an array.',
    constraints: ['1 <= array.length <= 100000', '-1000000000 <= array[i] <= 1000000000'],
    sampleInput: '[1, 2, 3, 4, 5]',
    sampleOutput: '15',
    testCases: [
      { stdin: '1 2 3 4 5', expected: '15' },
      { stdin: '10 20 30', expected: '60' },
      { stdin: '0', expected: '0' },
      { stdin: '-5 5', expected: '0' },
      { stdin: '100', expected: '100' }
    ],
    templates: {
      javascript: `function sumArray(arr) {
  // Your code here
  return 0;
}
console.log(sumArray([1,2,3,4,5]));`,
      python: `def sum_array(arr):
    # Your code here
    return 0`,
      java: `public class Solution {
    public int sumArray(int[] arr) {
        // Your code here
        return 0;
    }
}`,
      c: `#include <stdio.h>
int sumArray(int arr[], int n) {
    // Your code here
    return 0;
}
int main() {
    int arr[] = {1, 2, 3, 4, 5};
    printf("%d\\n", sumArray(arr, 5));
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;
int sumArray(vector<int>& arr) {
    // Your code here
    return 0;
}
int main() {
    vector<int> arr = {1, 2, 3, 4, 5};
    cout << sumArray(arr) << endl;
    return 0;
}`
    }
  },
  {
    id: '1-2',
    testNum: 1,
    difficulty: 'Medium',
    title: 'Two Sum',
    description: 'Given an array of integers and a target, find two numbers that add up to target. Return their indices.',
    constraints: ['2 <= array.length <= 10000', 'Exactly one solution exists'],
    sampleInput: '[2,7,11,15], target=9',
    sampleOutput: '[0,1]',
    testCases: [
      { stdin: '2 7 11 15\n9', expected: '[0,1]' },
      { stdin: '3 2 4\n6', expected: '[1,2]' },
      { stdin: '3 3\n6', expected: '[0,1]' },
      { stdin: '1 5 7 11\n16', expected: '[1,3]' },
      { stdin: '10 1 1 2\n11', expected: '[0,2]' }
    ],
    templates: {
      javascript: `function twoSum(arr, target) {
  // Your code here
  return [];
}`,
      python: `def two_sum(arr, target):
    # Your code here
    return []`,
      java: `public class Solution {
    public int[] twoSum(int[] arr, int target) {
        // Your code here
        return new int[2];
    }
}`,
      c: `#include <stdio.h>
void twoSum(int arr[], int n, int target) {
    // Your code here
    printf("[%d,%d]\\n", 0, 1);
}
int main() {
    int arr[] = {2, 7, 11, 15};
    twoSum(arr, 4, 9);
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;
vector<int> twoSum(vector<int>& arr, int target) {
    // Your code here
    return {};
}
int main() {
    vector<int> arr = {2, 7, 11, 15};
    auto result = twoSum(arr, 9);
    return 0;
}`
    }
  },
  {
    id: '1-3',
    testNum: 1,
    difficulty: 'Hard',
    title: 'Longest Substring Without Repeating',
    description: 'Find the length of the longest substring without repeating characters.',
    constraints: ['0 <= s.length <= 50000', 's consists of English letters, digits, symbols and spaces'],
    sampleInput: '"abcabcbb"',
    sampleOutput: '3',
    testCases: [
      { stdin: 'abcabcbb', expected: '3' },
      { stdin: 'bbbbb', expected: '1' },
      { stdin: 'pwwkew', expected: '3' },
      { stdin: 'au', expected: '2' },
      { stdin: 'dvdf', expected: '3' }
    ],
    templates: {
      javascript: `function lengthOfLongestSubstring(s) {
  // Your code here
  return 0;
}`,
      python: `def length_of_longest_substring(s):
    # Your code here
    return 0`,
      java: `public class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Your code here
        return 0;
    }
}`,
      c: `#include <stdio.h>
#include <string.h>
int lengthOfLongestSubstring(char* s) {
    // Your code here
    return 0;
}
int main() {
    printf("%d\\n", lengthOfLongestSubstring("abcabcbb"));
    return 0;
}`,
      cpp: `#include <iostream>
#include <string>
#include <unordered_set>
using namespace std;
int lengthOfLongestSubstring(string s) {
    // Your code here
    return 0;
}
int main() {
    cout << lengthOfLongestSubstring("abcabcbb") << endl;
    return 0;
}`
    }
  }
];

// Test 2: String Operations
const test2Problems = [
  {
    id: '2-1',
    testNum: 2,
    difficulty: 'Easy',
    title: 'Reverse String',
    description: 'Reverse a string and return the result.',
    constraints: ['1 <= s.length <= 10^5'],
    sampleInput: '"hello"',
    sampleOutput: '"olleh"',
    testCases: [
      { stdin: 'hello', expected: 'olleh' },
      { stdin: 'world', expected: 'dlrow' },
      { stdin: 'a', expected: 'a' },
      { stdin: 'ab', expected: 'ba' },
      { stdin: 'racecar', expected: 'racecar' }
    ],
    templates: {
      javascript: `function reverseString(s) {
  return s.split('').reverse().join('');
}`,
      python: `def reverse_string(s):
    return s[::-1]`,
      java: `public class Solution {
    public String reverseString(String s) {
        return new StringBuilder(s).reverse().toString();
    }
}`,
      c: `#include <stdio.h>
#include <string.h>
void reverseString(char s[], char result[]) {
    int len = strlen(s);
    for (int i = 0; i < len; i++) {
        result[i] = s[len - 1 - i];
    }
    result[len] = '\\0';
}
int main() {
    char result[50];
    reverseString("hello", result);
    printf("%s\\n", result);
    return 0;
}`,
      cpp: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;
string reverseString(string s) {
    reverse(s.begin(), s.end());
    return s;
}
int main() {
    cout << reverseString("hello") << endl;
    return 0;
}`
    }
  },
  {
    id: '2-2',
    testNum: 2,
    difficulty: 'Medium',
    title: 'Palindrome Check',
    description: 'Check if a string is a palindrome. Consider only alphanumeric characters and ignore case.',
    constraints: ['1 <= s.length <= 2 * 10^5'],
    sampleInput: '"A man, a plan, a canal: Panama"',
    sampleOutput: 'true',
    testCases: [
      { stdin: 'A man a plan a canal Panama', expected: 'true' },
      { stdin: 'race a car', expected: 'false' },
      { stdin: ' ', expected: 'true' },
      { stdin: '0P', expected: 'false' },
      { stdin: 'aba', expected: 'true' }
    ],
    templates: {
      javascript: `function isPalindrome(s) {
  // Your code here
  return false;
}`,
      python: `def is_palindrome(s):
    # Your code here
    return False`,
      java: `public class Solution {
    public boolean isPalindrome(String s) {
        // Your code here
        return false;
    }
}`,
      c: `#include <stdio.h>
#include <stdbool.h>
#include <ctype.h>
#include <string.h>
bool isPalindrome(char* s) {
    // Your code here
    return true;
}
int main() {
    printf("%d\\n", isPalindrome("A man a plan a canal Panama"));
    return 0;
}`,
      cpp: `#include <iostream>
#include <string>
#include <cctype>
using namespace std;
bool isPalindrome(string s) {
    // Your code here
    return false;
}
int main() {
    cout << isPalindrome("A man a plan a canal Panama") << endl;
    return 0;
}`
    }
  },
  {
    id: '2-3',
    testNum: 2,
    difficulty: 'Hard',
    title: 'Regular Expression Matching',
    description: 'Implement regular expression matching with support for \'.\' (any character) and \'*\' (zero or more of preceding element).',
    constraints: ['1 <= s.length <= 20', '1 <= p.length <= 30'],
    sampleInput: 's="aa", p="a"',
    sampleOutput: 'false',
    testCases: [
      { stdin: 'aa\na', expected: 'false' },
      { stdin: 'aa\na*', expected: 'true' },
      { stdin: 'ab\n.*', expected: 'true' },
      { stdin: 'aab\nc*a*b', expected: 'true' },
      { stdin: 'mississippi\nmis*is*p*.', expected: 'false' }
    ],
    templates: {
      javascript: `function isMatch(s, p) {
  // Your code here
  return false;
}`,
      python: `def is_match(s, p):
    # Your code here
    return False`,
      java: `public class Solution {
    public boolean isMatch(String s, String p) {
        // Your code here
        return false;
    }
}`,
      c: `#include <stdio.h>
#include <stdbool.h>
#include <string.h>
bool isMatch(char* s, char* p) {
    // Your code here
    return false;
}
int main() {
    printf("%d\\n", isMatch("aa", "a*"));
    return 0;
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
bool isMatch(string s, string p) {
    // Your code here
    return false;
}
int main() {
    cout << isMatch("aa", "a*") << endl;
    return 0;
}`
    }
  }
];

// Test 3: Array Operations
const test3Problems = [
  {
    id: '3-1',
    testNum: 3,
    difficulty: 'Easy',
    title: 'Find Maximum',
    description: 'Find the maximum element in an array.',
    constraints: ['1 <= array.length <= 10^4', '-10^9 <= array[i] <= 10^9'],
    sampleInput: '[1, 5, 3, 9, 2]',
    sampleOutput: '9',
    testCases: [
      { stdin: '1 5 3 9 2', expected: '9' },
      { stdin: '10', expected: '10' },
      { stdin: '-5 -1 -10', expected: '-1' },
      { stdin: '0 0 0', expected: '0' },
      { stdin: '100 50 75', expected: '100' }
    ],
    templates: {
      javascript: `function findMax(arr) {
  return Math.max(...arr);
}`,
      python: `def find_max(arr):
    return max(arr)`,
      java: `public class Solution {
    public int findMax(int[] arr) {
        int max = arr[0];
        for (int num : arr) max = Math.max(max, num);
        return max;
    }
}`,
      c: `#include <stdio.h>
int findMax(int arr[], int n) {
    int max = arr[0];
    for (int i = 1; i < n; i++) {
        if (arr[i] > max) max = arr[i];
    }
    return max;
}
int main() {
    int arr[] = {1, 5, 3, 9, 2};
    printf("%d\\n", findMax(arr, 5));
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int findMax(vector<int>& arr) {
    return *max_element(arr.begin(), arr.end());
}
int main() {
    vector<int> arr = {1, 5, 3, 9, 2};
    cout << findMax(arr) << endl;
    return 0;
}`
    }
  },
  {
    id: '3-2',
    testNum: 3,
    difficulty: 'Medium',
    title: 'Merge Sorted Arrays',
    description: 'Merge two sorted arrays into one sorted array.',
    constraints: ['0 <= nums1.length, nums2.length <= 200'],
    sampleInput: '[1,2,3], [2,5,6]',
    sampleOutput: '[1,2,2,3,5,6]',
    testCases: [
      { stdin: '1 2 3\n2 5 6', expected: '[1,2,2,3,5,6]' },
      { stdin: '\n0 0 3 4', expected: '[0,0,3,4]' },
      { stdin: '4 5 6\n1 2 3', expected: '[1,2,3,4,5,6]' },
      { stdin: '1\n1', expected: '[1,1]' },
      { stdin: '5\n1 2 3', expected: '[1,2,3,5]' }
    ],
    templates: {
      javascript: `function mergeSorted(arr1, arr2) {
  return [...arr1, ...arr2].sort((a,b) => a-b);
}`,
      python: `def merge_sorted(arr1, arr2):
    return sorted(arr1 + arr2)`,
      java: `public class Solution {
    public int[] mergeSorted(int[] arr1, int[] arr2) {
        int[] result = new int[arr1.length + arr2.length];
        // Your code here
        return result;
    }
}`,
      c: `#include <stdio.h>
void mergeSorted(int arr1[], int n1, int arr2[], int n2, int result[]) {
    // Your code here
}
int main() {
    int arr1[] = {1, 2, 3};
    int arr2[] = {2, 5, 6};
    int result[6];
    mergeSorted(arr1, 3, arr2, 3, result);
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
vector<int> mergeSorted(vector<int>& arr1, vector<int>& arr2) {
    vector<int> result;
    merge(arr1.begin(), arr1.end(), arr2.begin(), arr2.end(), back_inserter(result));
    return result;
}
int main() {
    vector<int> arr1 = {1, 2, 3};
    vector<int> arr2 = {2, 5, 6};
    auto result = mergeSorted(arr1, arr2);
    return 0;
}`
    }
  },
  {
    id: '3-3',
    testNum: 3,
    difficulty: 'Hard',
    title: 'Median of Two Sorted Arrays',
    description: 'Find the median of two sorted arrays. Time complexity should be O(log(min(m,n))).',
    constraints: ['0 <= m, n <= 1000', 'm != n or both empty'],
    sampleInput: '[1,3], [2]',
    sampleOutput: '2',
    testCases: [
      { stdin: '1 3\n2', expected: '2' },
      { stdin: '1 2\n3 4', expected: '2.5' },
      { stdin: '0 0\n1', expected: '0.5' },
      { stdin: '1 2 3\n4 5', expected: '3' },
      { stdin: '0 1 2\n8 9 10', expected: '5' }
    ],
    templates: {
      javascript: `function findMedianSortedArrays(nums1, nums2) {
  // Your code here
  return 0;
}`,
      python: `def find_median_sorted_arrays(nums1, nums2):
    # Your code here
    return 0`,
      java: `public class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        // Your code here
        return 0.0;
    }
}`,
      c: `#include <stdio.h>
double findMedianSortedArrays(int nums1[], int m, int nums2[], int n) {
    // Your code here
    return 0.0;
}
int main() {
    int nums1[] = {1, 3};
    int nums2[] = {2};
    printf("%.1f\\n", findMedianSortedArrays(nums1, 2, nums2, 1));
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;
double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
    // Your code here
    return 0.0;
}
int main() {
    vector<int> nums1 = {1, 3};
    vector<int> nums2 = {2};
    cout << findMedianSortedArrays(nums1, nums2) << endl;
    return 0;
}`
    }
  }
];

// Test 4: Algorithmic Challenges
const test4Problems = [
  {
    id: '4-1',
    testNum: 4,
    difficulty: 'Easy',
    title: 'Fibonacci Number',
    description: 'Return the nth Fibonacci number.',
    constraints: ['0 <= n <= 50'],
    sampleInput: '4',
    sampleOutput: '3',
    testCases: [
      { stdin: '4', expected: '3' },
      { stdin: '0', expected: '0' },
      { stdin: '1', expected: '1' },
      { stdin: '6', expected: '8' },
      { stdin: '10', expected: '55' }
    ],
    templates: {
      javascript: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n-1) + fibonacci(n-2);
}`,
      python: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)`,
      java: `public class Solution {
    public long fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n-1) + fibonacci(n-2);
    }
}`,
      c: `#include <stdio.h>
long fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);
}
int main() {
    printf("%ld\\n", fibonacci(4));
    return 0;
}`,
      cpp: `#include <iostream>
using namespace std;
long fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);
}
int main() {
    cout << fibonacci(4) << endl;
    return 0;
}`
    }
  },
  {
    id: '4-2',
    testNum: 4,
    difficulty: 'Medium',
    title: 'Binary Search',
    description: 'Find target in sorted array using binary search. Return index or -1 if not found.',
    constraints: ['1 <= nums.length <= 10000', '-10000 <= target <= 10000'],
    sampleInput: '[1,3,5,6,7], target=5',
    sampleOutput: '2',
    testCases: [
      { stdin: '1 3 5 6 7\n5', expected: '2' },
      { stdin: '1 3 5 6 7\n4', expected: '-1' },
      { stdin: '1\n1', expected: '0' },
      { stdin: '1 3 5\n3', expected: '1' },
      { stdin: '2 5 8 12\n12', expected: '3' }
    ],
    templates: {
      javascript: `function binarySearch(nums, target) {
  // Your code here
  return -1;
}`,
      python: `def binary_search(nums, target):
    # Your code here
    return -1`,
      java: `public class Solution {
    public int binarySearch(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        // Your code here
        return -1;
    }
}`,
      c: `#include <stdio.h>
int binarySearch(int nums[], int n, int target) {
    int left = 0, right = n - 1;
    // Your code here
    return -1;
}
int main() {
    int nums[] = {1, 3, 5, 6, 7};
    printf("%d\\n", binarySearch(nums, 5, 5));
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;
int binarySearch(vector<int>& nums, int target) {
    int left = 0, right = nums.size() - 1;
    // Your code here
    return -1;
}
int main() {
    vector<int> nums = {1, 3, 5, 6, 7};
    cout << binarySearch(nums, 5) << endl;
    return 0;
}`
    }
  },
  {
    id: '4-3',
    testNum: 4,
    difficulty: 'Hard',
    title: 'Wildcard Matching',
    description: 'Match a string with a pattern containing \'?\' (single char) and \'*\' (any sequence).',
    constraints: ['0 <= s.length, p.length <= 2000'],
    sampleInput: 's="aa", p="a"',
    sampleOutput: 'false',
    testCases: [
      { stdin: 'aa\na', expected: 'false' },
      { stdin: 'aa\n*', expected: 'true' },
      { stdin: 'cb\n?a', expected: 'false' },
      { stdin: 'adceb\n*a*b', expected: 'true' },
      { stdin: 'acdcb\na*c?b', expected: 'false' }
    ],
    templates: {
      javascript: `function isWildcardMatch(s, p) {
  // Your code here
  return false;
}`,
      python: `def is_wildcard_match(s, p):
    # Your code here
    return False`,
      java: `public class Solution {
    public boolean isWildcardMatch(String s, String p) {
        // Your code here
        return false;
    }
}`,
      c: `#include <stdio.h>
#include <stdbool.h>
bool isWildcardMatch(char* s, char* p) {
    // Your code here
    return false;
}
int main() {
    printf("%d\\n", isWildcardMatch("aa", "*"));
    return 0;
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
bool isWildcardMatch(string s, string p) {
    // Your code here
    return false;
}
int main() {
    cout << isWildcardMatch("aa", "*") << endl;
    return 0;
}`
    }
  }
];

// Test 5: Advanced Problems
const test5Problems = [
  {
    id: '5-1',
    testNum: 5,
    difficulty: 'Easy',
    title: 'Duplicate Check',
    description: 'Check if array contains duplicates.',
    constraints: ['1 <= nums.length <= 100000', '-1000000000 <= nums[i] <= 1000000000'],
    sampleInput: '[1, 2, 3, 1]',
    sampleOutput: 'true',
    testCases: [
      { stdin: '1 2 3 1', expected: 'true' },
      { stdin: '1 2 3 4', expected: 'false' },
      { stdin: '1', expected: 'false' },
      { stdin: '99 99', expected: 'true' },
      { stdin: '1 2 3 4 5', expected: 'false' }
    ],
    templates: {
      javascript: `function hasDuplicate(nums) {
  return new Set(nums).size !== nums.length;
}`,
      python: `def has_duplicate(nums):
    return len(nums) != len(set(nums))`,
      java: `public class Solution {
    public boolean hasDuplicate(int[] nums) {
        java.util.Set<Integer> set = new java.util.HashSet<>();
        for (int num : nums) {
            if (!set.add(num)) return true;
        }
        return false;
    }
}`,
      c: `#include <stdio.h>
#include <stdbool.h>
bool hasDuplicate(int nums[], int n) {
    // Your code here
    return false;
}
int main() {
    int nums[] = {1, 2, 3, 1};
    printf("%d\\n", hasDuplicate(nums, 4));
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_set>
using namespace std;
bool hasDuplicate(vector<int>& nums) {
    unordered_set<int> seen;
    for (int num : nums) {
        if (seen.count(num)) return true;
        seen.insert(num);
    }
    return false;
}
int main() {
    vector<int> nums = {1, 2, 3, 1};
    cout << hasDuplicate(nums) << endl;
    return 0;
}`
    }
  },
  {
    id: '5-2',
    testNum: 5,
    difficulty: 'Medium',
    title: 'Longest Common Prefix',
    description: 'Find the longest common prefix among an array of strings.',
    constraints: ['1 <= strs.length <= 200', '0 <= strs[i].length <= 200'],
    sampleInput: '["flower","flow","flight"]',
    sampleOutput: '"fl"',
    testCases: [
      { stdin: 'flower flow flight', expected: 'fl' },
      { stdin: 'dog racecar car', expected: '' },
      { stdin: 'a', expected: 'a' },
      { stdin: 'ab a', expected: 'a' },
      { stdin: 'abc abc abc', expected: 'abc' }
    ],
    templates: {
      javascript: `function longestCommonPrefix(strs) {
  // Your code here
  return '';
}`,
      python: `def longest_common_prefix(strs):
    # Your code here
    return ''`,
      java: `public class Solution {
    public String longestCommonPrefix(String[] strs) {
        // Your code here
        return "";
    }
}`,
      c: `#include <stdio.h>
#include <string.h>
char* longestCommonPrefix(char** strs, int n) {
    // Your code here
    return "";
}
int main() {
    char* strs[] = {"flower", "flow", "flight"};
    printf("%s\\n", longestCommonPrefix(strs, 3));
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;
string longestCommonPrefix(vector<string>& strs) {
    // Your code here
    return "";
}
int main() {
    vector<string> strs = {"flower", "flow", "flight"};
    cout << longestCommonPrefix(strs) << endl;
    return 0;
}`
    }
  },
  {
    id: '5-3',
    testNum: 5,
    difficulty: 'Hard',
    title: 'N-Queens Solution Count',
    description: 'Count the number of ways to place N queens on an N×N chessboard such that no two queens threaten each other.',
    constraints: ['1 <= n <= 9'],
    sampleInput: '4',
    sampleOutput: '2',
    testCases: [
      { stdin: '4', expected: '2' },
      { stdin: '1', expected: '1' },
      { stdin: '8', expected: '92' },
      { stdin: '3', expected: '0' },
      { stdin: '5', expected: '10' }
    ],
    templates: {
      javascript: `function solveNQueens(n) {
  // Your code here
  return 0;
}`,
      python: `def solve_n_queens(n):
    # Your code here
    return 0`,
      java: `public class Solution {
    public int solveNQueens(int n) {
        // Your code here
        return 0;
    }
}`,
      c: `#include <stdio.h>
int solveNQueens(int n) {
    // Your code here
    return 0;
}
int main() {
    printf("%d\\n", solveNQueens(4));
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;
int solveNQueens(int n) {
    // Your code here
    return 0;
}
int main() {
    cout << solveNQueens(4) << endl;
    return 0;
}`
    }
  }
];

export const allProblems = [
  ...test1Problems,
  ...test2Problems,
  ...test3Problems,
  ...test4Problems,
  ...test5Problems
];
